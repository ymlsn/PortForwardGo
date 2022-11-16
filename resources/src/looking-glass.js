var nodes = [];

$("#node").on("change", function () {
    var node_id = $("#node option:selected").val();
    if (node_id == "0") {
        $("#outbound").html("<option value>系统默认</option>");
        $("#outbound").attr("disabled", true);
        $("#tool").attr("disabled", true)
        $("#host").attr("disabled", true)
        $("#port").attr("disabled", true)
        $("#start").attr("disabled", true);

        $("#parallel").attr("disabled", true);
        $("#reverse").attr("disabled", true);
        $("#udp").attr("disabled", true);
        $("#ipv6").attr("disabled", true);

        mdui.updateTextFields()

        return
    }

    $("#outbound").html("<option value>系统默认</option>");
    if (nodes[node_id].outbounds != null && nodes[node_id].outbounds.length > 0) {
        for (i in nodes[node_id].outbounds) {
            var outbound = nodes[node_id].outbounds[i];
            $("#outbound").append(`<option value="${outbound}">${outbound}</option>`);
        }
    }

    $("#outbound").removeAttr("disabled");
    $("#tool").removeAttr("disabled")
    $("#host").removeAttr("disabled")
    $("#port").removeAttr("disabled")
    $("#start").removeAttr("disabled");

    $("#parallel").removeAttr("disabled");
    $("#reverse").removeAttr("disabled");
    $("#udp").removeAttr("disabled");
    $("#ipv6").removeAttr("disabled");

    mdui.mutation()
    mdui.updateTextFields()
})

$("#tool").on("change", function () {
    var tool = $("#tool option:selected").val();

    var show_port = false
    var show_iperf3 = false
    switch (tool) {
        case "ping": case "mtr":
            break;
        case "tcping":
            show_port = true
            break;
        case "iperf3":
            show_port = true
            show_iperf3 = true
            break;
    }

    if (show_port) {
        $("#div_port").removeAttr("style");
    } else {
        $("#div_port").attr("style", "display: none;");
    }

    if (show_iperf3) {
        $("#div_iperf3").removeAttr("style");
    } else {
        $("#div_iperf3").attr("style", "display: none;");
    }
})

$("#start").on('click', function () {
    var node_id = $("#node option:selected").val();
    if (node_id == "0") {
        $("#outbound").html("<option value>系统默认</option>");
        $("#outbound").attr("disabled", true);
        $("#tool").attr("disabled", true)
        $("#host").attr("disabled", true)
        $("#port").attr("disabled", true)
        $("#start").attr("disabled", true);
        return
    }

    var outbound = $("#outbound option:selected").val();
    var tool = $("#tool").val();
    var host = $("#host").val();
    var port = $("#port").val();
    if (!host) {
        sendmsg("目标地址不能为空");
        return
    }

    var parallel = Number($("#parallel").val());
    var reverse = $("#reverse").prop("checked");
    var udp = $("#udp").prop("checked");
    var ipv6 = $("#ipv6").prop("checked");

    if (!parallel) {
        parallel = 1;
    }

    $("#node").attr("disabled", true)
    $("#outbound").attr("disabled", true);
    $("#tool").attr("disabled", true)
    $("#host").attr("disabled", true)
    $("#port").attr("disabled", true)
    $("#start").attr("disabled", true);

    $("#parallel").attr("disabled", true);
    $("#reverse").attr("disabled", true);
    $("#udp").attr("disabled", true);
    $("#ipv6").attr("disabled", true);

    $("#result").attr("hidden", true)
    $("#mtr-table").attr("hidden", true)
    $("#iperf3-table").attr("hidden", true)
    $("#iperf3-udp-table").attr("hidden", true)
    $("#result").empty()
    $("#mtr-table-body").empty()
    $("#iperf3-table-body").empty()
    $("#iperf3-udp-table-body").empty()

    $("#progress").removeAttr("hidden")

    switch (tool) {
        case "ping":
            ping(node_id, outbound, host)
            break
        case "tcping":
            if (!port) {
                sendmsg("端口不能为空");
                finished();
                return
            }

            tcping(node_id, outbound, host, port)
            break
        case "mtr":
            mtr(node_id, outbound, host)
            break
        case "iperf3":
            if (!port) {
                port = 5201;
            }

            iperf3(node_id, outbound, host, port, parallel, reverse, udp, ipv6)
            break;
        default:
            sendmsg("暂不支持");
            finished();
    }
})

function finished() {
    $("#node").removeAttr("disabled")
    $("#outbound").removeAttr("disabled");
    $("#tool").removeAttr("disabled")
    $("#host").removeAttr("disabled")
    $("#port").removeAttr("disabled")
    $("#start").removeAttr("disabled")

    $("#parallel").removeAttr("disabled");
    $("#reverse").removeAttr("disabled");
    $("#udp").removeAttr("disabled");
    $("#ipv6").removeAttr("disabled");

    $("#progress").attr("hidden", true)
}

function ping(node_id, outbound, host) {
    $("#result").removeAttr("hidden")

    url = window.location.href.replace("http", "ws") + "/ping?node=" + node_id + "&outbound=" + outbound + "&host=" + host
    var socket = new WebSocket(url);

    socket.onmessage = (msg) => {
        var response = JSON.parse(msg.data)
        $("#result").append(response.Data);
    }

    socket.onclose = () => {
        finished();
        sendmsg("操作完成");
    }

    socket.onerror = () => {
        finished();
        sendmsg("连接出错");
    }
}

function tcping(node_id, outbound, host, port) {
    $("#result").removeAttr("hidden")
    url = window.location.href + "/tcping?node=" + node_id + "&outbound=" + outbound + "&host=" + host + "&port=" + port

    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
    }).done(function (response) {
        if (!response.Ok) {
            $("#result").append("连接失败, 错误: " + response.Data);
            finished()
            return
        }

        for (ip in response.Data) {
            $("#result").append("[" + ip + "]: " + response.Data[ip] + " <br>");
        }

        finished()
    }).fail(function () {
        finished();
        sendmsg("连接出错");
    });
}

function mtr(node_id, outbound, host) {
    $("#mtr-table").removeAttr("hidden")

    url = window.location.href.replace("http", "ws") + "/mtr?node=" + node_id + "&outbound=" + outbound + "&host=" + host
    var socket = new WebSocket(url);

    socket.onmessage = (msg) => {
        var response = JSON.parse(msg.data)

        if (!response.Ok) {
            $("#mtr-table-body").append('<tr><td colspan="9" class="text-center">错误: ' + response
                .Data + '</td></tr>');
            finished();
            return;
        }

        if (response.Data.Host == "") {
            response.Data.Host = "*"
            var info = ""
            var asn = {
                num: "-",
                info: "",
            }
        } else {
            var info = ""
            var asn = {
                num: "-",
                info: "",
            }

            $.ajax({
                async: false,
                url: "https://api.coiaprant.top/geo_ip?ip=" + response.Data.Host,
                type: "GET",
                dataType: "json",
            }).done(function (resp) {
                if (resp.Ok) {
                    info = resp.Result.Area + " " + resp.Result.ISP
                    if (resp.Result.ASN.Number != 0) {
                        asn.num = "AS" + resp.Result.ASN.Number
                        if (asn.num != resp.Result.ASN.Org) {
                            asn.info = resp.Result.ASN.Org
                        }
                    }
                }
            });
        }

        $("#mtr-table-body").append('<tr><td>' + response.Data.TTL + "</td><td><strong>" + response.Data.Host +
            '</strong><br><small>' + info + '</small></td><td><strong>' + asn.num +
            "</strong><br><small>" +
            asn.info + "</small></td><td><strong>" + response.Data.LossPercent.toFixed(2) +
            "%</strong></td><td>" + response.Data.Sent + "</td><td><strong>" + response.Data.Last
                .toFixed(
                    2) + "ms</strong></td><td>" + response.Data.Avg.toFixed(2) + "ms</td><td>" + response
                        .Data
                        .Best
                        .toFixed(2) + "ms</td><td>" + response.Data.Worst.toFixed(2) + 'ms</td></tr>');

    }

    socket.onclose = () => {
        finished();
        sendmsg("操作完成");
    }

    socket.onerror = (e) => {
        finished();
        sendmsg("连接出错");
    }
}

function iperf3(node_id, outbound, host, port, parallel, reverse, udp, ipv6) {
    if (udp) $("#iperf3-udp-table").removeAttr("hidden"); else $("#iperf3-table").removeAttr("hidden")

    url = window.location.href.replace("http", "ws") + "/iperf3?node=" + node_id + "&outbound=" + outbound + "&host=" + host + "&port=" + port + "&parallel=" + parallel + "&reverse=" + reverse + "&udp=" + udp + "&ipv6=" + ipv6
    var socket = new WebSocket(url);

    var count = 0
    socket.onmessage = (msg) => {
        var response = JSON.parse(msg.data)

        if (!response.Ok) {
            if (udp) {
                $("#iperf3-udp-table-body").append('<tr><td colspan="7" class="text-center">' + response
                    .Data + '</td></tr>');
            } else {
                $("#iperf3-table-body").append('<tr><td colspan="7" class="text-center">' + response
                    .Data + '</td></tr>');
            }
            finished();
            return;
        }

        if (response.Data.Id == "ID") {
            count += 1
            if (count == 2) {
                if (udp) {
                    $("#iperf3-udp-table-body").append(`<tr><td colspan="7"></td></tr>`);
                } else {
                    $("#iperf3-table-body").append(`<tr><td colspan="7"></td></tr>`);
                }
            }
            return;
        }
        if (udp) {
            $("#iperf3-udp-table-body").append(`<tr>
            <td>${response.Data.Id}</td>
            <td>${response.Data.Interval}</td>
            <td>${response.Data.Transfer}</td>
            <td>${response.Data.Bitrate}</td>
            <td>${response.Data.Jitter}</td>
            <td>${response.Data.Datagrams}</td>
            <td>${response.Data.Tag}</td>
            </tr>`);
        } else {
            $("#iperf3-table-body").append(`<tr>
        <td>${response.Data.Id}</td>
        <td>${response.Data.Interval}</td>
        <td>${response.Data.Transfer}</td>
        <td>${response.Data.Bitrate}</td>
        <td>${response.Data.Retr}</td>
        <td>${response.Data.Cwnd}</td>
        <td>${response.Data.Tag}</td>
        </tr>`);
        }

        if (response.Data.Id == "SUM" && response.Data.Tag == "") {
            if (udp) {
                $("#iperf3-udp-table-body").append(`<tr><td colspan="7"></td></tr>`);
             } else {
                $("#iperf3-table-body").append(`<tr><td colspan="7"></td></tr>`);
            }
        }
    }

    socket.onclose = () => {
        finished();
        sendmsg("操作完成");
    }

    socket.onerror = (e) => {
        finished();
        sendmsg("连接出错");
    }
}

adminBanner();
$.ajax({
    method: "GET",
    url: "/ajax/node",
    dataType: "json",
    async: false,
})
    .done(function (response) {
        if (response.Ok) {
            done();

            for (i in response.Data) {
                var node = response.Data[i];

                switch (node.permission) {
                    case 0:
                        break;
                    default:
                        nodes[node.id] = node;
                        $("#node").append(`<option value="${node.id}">${node.id} | ${node.name}</option>`);

                }
            }

        } else sendmsg(response.Msg);
    })
    .fail(function () {
        sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });