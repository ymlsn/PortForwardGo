var protocol = {
    tcpudp: "TCP+UDP",
    http: "HTTP",
    https: "HTTPS",
    host: "TLS HOST",
    secure: "Secure隧道",
    securex: "SecureX隧道",
    tls: "TLS隧道",
};

var Tips = {};
var statusCard = new Vue({
    el: '#view',
    data: {
        nodes: {},
        is_admin: false,
    },
    methods: {
        toFixed2(f) {
            return f.toFixed(2)
        },

        secondToDate(s) {
            var d = Math.floor(s / 3600 / 24);
            if (d > 0) {
                return d + " 天"
            }
            var h = Math.floor(s / 3600 % 24);
            var m = Math.floor(s / 60 % 60);
            var s = Math.floor(s % 60);
            return h + ":" + ("0" + m).slice(-2) + ":" + ("0" + s).slice(-2);
        },

        readableBytes(bytes) {
            if (!bytes) {
                return '0B'
            }
            var i = Math.floor(Math.log(bytes) / Math.log(1024)),
                sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
            return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + sizes[i];
        },

        readableNetBytes(bytes) {
            if (!bytes) {
                return '0B'
            }
            var Kbps = 125, Mbps = Kbps * 1000, Gbps = Mbps * 1000, Tbps = Gbps * 1000;
            if (bytes < Kbps) return (bytes * 8).toFixed(2) + 'bps';
            if (bytes < Mbps) return (bytes / Kbps).toFixed(2) + 'Kbps';
            if (bytes < Gbps) return (bytes / Mbps).toFixed(2) + 'Mbps';
            if (bytes < Tbps) return (bytes / Gbps).toFixed(2) + 'Gbps';
            else return (bytes / Tbps).toFixed(2) + 'Tbps';
        },

        formatTimestamp(t) {
            return new Date(t * 1000).toLocaleString()
        },

        formatByteSize(bs) {
            const x = this.readableBytes(bs)
            return x != "NaN undefined" ? x : 'NaN'
        },

        formatNetByteSize(bs) {
            const x = this.readableNetBytes(bs)
            return x != "NaN undefined" ? x : 'NaN'
        },

        openTerminal(nodeid, session_id) {
            window.open(`/admin/terminal?id=${nodeid}&session=${session_id}`, "_blank");
        },
    }
})

function connect(initial) {
    var ws = new WebSocket(window.location.href.replace("http", "ws"));

    var connected = false
    ws.onopen = function () {
        connected = true
        sendmsg("已连接服务器");
    }

    ws.onmessage = function (event) {
        if (initial) { initial = false; done(); }
        var data = JSON.parse(event.data)

        for (nodeid in data.Nodes) {
            if (Tips[nodeid] == null) {
                Tips[nodeid] = {};
            }

            if (statusCard.nodes[nodeid] == null) {
                load_nodes();
            }

            if (statusCard.nodes[nodeid] == null) {
                Vue.set(statusCard.nodes, node.id, {
                    name: "未知节点",
                    servers: [],
                })
            }

            var servers = data.Nodes[nodeid];
            if (statusCard.nodes[nodeid].servers.length == 0) {
                Vue.set(statusCard.nodes[nodeid], servers, servers)
            }

            statusCard.nodes[nodeid].servers = servers

            for (id in servers) {
                var server = servers[id]

                if (!server.Host) {
                    server.live = false
                    continue;
                }

                if (data.Now - server.Active > 10) {
                    server.live = false
                    continue;
                }

                server.live = true

                if ($(`#${nodeid}-${server.SessionId}`).length == 0) continue;

                if (Tips[nodeid][server.SessionId] == null) {
                    Tips[nodeid][server.SessionId] = {
                        info: new mdui.Tooltip(`#info-${nodeid}-${server.SessionId}`, {}),
                        up: new mdui.Tooltip(`#up-${nodeid}-${server.SessionId}`, {}),
                        down: new mdui.Tooltip(`#down-${nodeid}-${server.SessionId}`, {}),
                        cpu: new mdui.Tooltip(`#cpu-${nodeid}-${server.SessionId}`, {}),
                        mem: new mdui.Tooltip(`#mem-${nodeid}-${server.SessionId}`, {}),
                        swap: new mdui.Tooltip(`#swap-${nodeid}-${server.SessionId}`, {}),
                        disk: new mdui.Tooltip(`#disk-${nodeid}-${server.SessionId}`, {}),
                        uptime: new mdui.Tooltip(`#uptime-${nodeid}-${server.SessionId}`, {}),
                    }
                }

                if (server.Host.Virtualization == "") server.Host.Virtualization = "未知";

                var tip = Tips[nodeid][server.SessionId];
                tip.info.$element[0].innerHTML = `系统 ${server.Host.Platform} ${server.Host.PlatformVersion}<br>架构 ${server.Host.Arch}<br>虚拟化 ${server.Host.Virtualization}<br>版本 ${server.Host.Version}`;
                tip.up.$element[0].innerHTML = "总上传 " + statusCard.readableBytes(server.State.NetInTransfer) + "<br><br>连接数:<br>TCP " + server.State.TcpConnCount + "<br>UDP " + server.State.UdpConnCount;
                tip.down.$element[0].innerHTML = "总下载 " + statusCard.readableBytes(server.State.NetOutTransfer) + "<br><br>连接数:<br>TCP " + server.State.TcpConnCount + "<br>UDP " + server.State.UdpConnCount;
                tip.cpu.$element[0].innerHTML = "CPU:<br>" + server.Host.CPU.join("<br>") + "<br><br>平均负载 " + server.State.Load1 + " / " + server.State.Load5 + " / " + server.State.Load15 + "<br>进程数 " + server.State.ProcessCount;
                tip.mem.$element[0].innerHTML = "内存: " + statusCard.formatByteSize(server.State.MemUsed) + ' / ' + statusCard.formatByteSize(server.Host.MemTotal);
                tip.swap.$element[0].innerHTML = "Swap: " + statusCard.formatByteSize(server.State.SwapUsed) + ' / ' + statusCard.formatByteSize(server.Host.SwapTotal);
                tip.disk.$element[0].innerHTML = "储存: " + statusCard.formatByteSize(server.State.DiskUsed) + ' / ' + statusCard.formatByteSize(server.Host.DiskTotal);
                tip.uptime.$element[0].innerHTML = "启动时间 " + statusCard.formatTimestamp(server.Host.BootTime) + "<br>活动时间 " + statusCard.formatTimestamp(server.Active);

            }
        }

        mdui.mutation();
    }

    ws.onclose = function () {
        if (connected) sendmsg("服务器连接断开");
        setTimeout(function () {
            connect(initial);
        }, 3000);
    }

    ws.onerror = function () {
        ws.close()
    }
}

function load_nodes() {
    $.ajax({
        method: "GET",
        url: "/ajax/node",
        dataType: "json",
        async: false,
    })
        .done(function (response) {
            if (response.Ok) {
                for (i in response.Data) {
                    var node = response.Data[i];

                    if (statusCard.nodes[node.id] == null) {
                        Vue.set(statusCard.nodes, node.id, {
                            name: node.name,
                            servers: [],
                        });

                        var protocols = [];
                        {
                            var _protocols = node.protocol.split("|")
                            for (i in _protocols) {
                                var p = _protocols[i];
                                protocols.push(protocol[p])
                            }
                        }

                        var nat_protocols = [];
                        {
                            var _protocols = node.nat_protocol.split("|")
                            for (i in _protocols) {
                                var p = _protocols[i];
                                nat_protocols.push(protocol[p])
                            }
                        }

                        var html = "";
                        html += "倍率 " + node.traffic;
                        html += "<br>"

                        html += "速率 " + node.speed;
                        html += "<br>"
                        html += "<br>"

                        html += "转发协议 " + protocols.join(",");
                        html += "<br>"

                        html += "穿透协议 " + nat_protocols.join(",");
                        html += "<br>"

                        html += "端口范围 " + node.port_range;
                        html += "<br>"

                        if (node.reseved_ports != "") {
                            html += "保留端口 " + node.reseved_ports.replaceAll("\n", ",")
                            html += "<br>"
                        }

                        if (node.reseved_target_ports != "") {
                            html += "保留目标端口 " + node.reseved_target_ports.replaceAll("\n", ",")
                            html += "<br>"
                        }

                        if (node.icp) {
                            html += "此节点HTTP/HTTPS转发需要备案域名"
                            html += "<br>"
                        }

                        if (node.tls_verify) {
                            html += "此节点所有TLS流量需要可信证书"
                            html += "<br>"
                        }

                        if (node.tls_verify_host) {
                            html += "此节点 HTTPS / TLS HOST 转发需要可信证书"
                            html += "<br>"
                        }

                        if (node.blocked_protocol != "") {
                            html += "屏蔽协议 " + node.blocked_protocol
                            html += "<br>"
                        }

                        if (node.blocked_hostname != "") {
                            html += "屏蔽SNI " + node.blocked_hostname
                            html += "<br>"
                        }

                        if (node.blocked_path != "") {
                            html += "屏蔽Path " + node.blocked_path
                            html += "<br>"
                        }

                        if (node.note != "") {
                            html += "<br>"
                            html += "说明 " + node.note
                        }

                        setTimeout(function (nodeid, html) {
                            new mdui.Tooltip(`#info_${nodeid}`, { content: html })
                            return;
                        }, 1000, node.id, html)
                    } else {
                        statusCard.nodes[node.id].name = node.name;
                    }
                }

                mdui.mutation()
            } else sendmsg(response.Msg);
        })
        .fail(function () {
            sendmsg("未能获取服务器数据, 请检查网络是否正常");
        });
}

$.ajax({
    method: "GET",
    url: "/ajax/userInfo",
    dataType: "json",
})
    .done(function (response) {
        if (response.Ok) {
            user = response.Data;

            if (user.permission == 2) {
                $("#admin_banner").removeAttr("style");
                statusCard.is_admin = true;
            }

            load_nodes();
            connect(true);
        } else sendmsg(response.Msg);
    })
    .fail(function () {
        sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });

