var domparser = new DOMParser();
var permissions = [];
var nodes = [];
var settings = [];
var info = new mdui.Dialog("#tag_Info");
var add = new mdui.Dialog("#tag_Add");
var edit = new mdui.Dialog("#tag_Edit");

var protocol = {
  tcpudp: "TCP+UDP",
  http: "HTTP",
  https: "HTTPS",
  host: "TLS HOST",
  secure: "Secure隧道",
  securex: "SecureX隧道",
  tls: "TLS隧道",
};

$("#add").on("click", function () {
  $("#add_name").val("");

  $("#add_addr").val("");
  $("#add_ips").val("");
  $("#add_mode option:selected").removeAttr("selected");
  $("#add_traffic").val("");
  $("#add_speed").val("");

  $("#add_icp").prop("checked", false);
  $("#add_firewall").prop("checked", false);
  $("#add_tls_verify").prop("checked", false);
  $("#add_tls_verify_host").prop("checked", false);
  $("#add_blocked_protocol").val("");
  $("#add_blocked_hostname").val("");
  $("#add_blocked_path").val("");

  $("#tag_add_outbounds").empty();
  $("#tag_edit_outbounds").empty();

  $("#add_nat_port").val("");
  $("#add_http_port").val("");
  $("#add_https_port").val("");
  $("#add_secure_port").val("");
  $("#add_securex_port").val("");
  $("#add_tls_port").val("");

  $("input[type=checkbox][data-type=add-permissions]").each(function (_, item) {
    item.checked = false
  });

  $("input[type=checkbox][data-type=add-protocol]").each(function (_, item) {
    item.checked = false
  });

  $("input[type=checkbox][data-type=add-nat-protocol]").each(function (_, item) {
    item.checked = false
  });

  $("#add_sni").val("");
  $("#add_port_range").val("");
  $("#add_reseved_port").val("");
  $("#add_reseved_target_port").val("");
  $("#add_note").val("");


  mdui.mutation()
  mdui.updateTextFields()
  add.open();
});

$("#add_enter").on("click", function () {
  var name = $("#add_name").val();
  var addr = $("#add_addr").val();
  var assign_ips = $("#add_ips").val();
  var mode = Number($("#add_mode option:selected").val());
  var traffic = Number($("#add_traffic").val());
  var speed = Number($("#add_speed").val());

  var icp = $("#add_icp").prop("checked");
  var firewall = $("#add_firewall").prop("checked");
  var tls_verify = $("#add_tls_verify").prop("checked");
  var tls_verify_host = $("#add_tls_verify_host").prop("checked");
  var blocked_protocol = $("#add_blocked_protocol").val();
  var blocked_hostname = $("#add_blocked_hostname").val();
  var blocked_path = $("#add_blocked_path").val();

  var outbounds = {};

  var nat_port = Number($("#add_nat_port").val());
  var http_port = Number($("#add_http_port").val());
  var https_port = Number($("#add_https_port").val());
  var secure_port = Number($("#add_secure_port").val());
  var securex_port = Number($("#add_securex_port").val());
  var tls_port = Number($("#add_tls_port").val());

  var protocol = []
  $("input[type=checkbox][data-type=add-protocol]").each(function (_, item) {
    if (item.checked) protocol.push($(this).attr("protocol"))
  });

  var nat_protocol = [];
  $("input[type=checkbox][data-type=add-nat-protocol]").each(function (_, item) {
    if (item.checked) nat_protocol.push($(this).attr("protocol"))
  });

  var permission = [];
  $("input[type=checkbox][data-type=add-permissions]").each(function (_, item) {
    if (item.checked) permission.push(Number($(this).attr("data-permission")))
  });

  var sni = $("#add_sni").val();
  var port_range = $("#add_port_range").val();
  var reseved_port = $("#add_reseved_port").val();
  var reseved_target_port = $("#add_reseved_target_port").val();
  var note = $("#add_note").val();

  if (!name || !addr || !port_range || !sni) {
    sendmsg("请填写名称, 节点地址, 端口范围, TLS隧道SNI");
    return;
  }

  $("input[outbound][data-type=name]").each(function (index, item) {
    if (!item.value) {
      sendmsg("请填完所有选项");
      return;
    }

    var ip = $("input[outbound=" + index + "][data-type=ip]").val();
    outbounds[item.value] = ip;
  });

  $.ajax({
    method: "POST",
    url: "/ajax/admin/node",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,

      addr: addr,
      assign_ips: assign_ips,
      mode: mode,
      traffic: traffic,
      speed: speed,

      icp: icp,
      firewall: firewall,
      tls_verify: tls_verify,
      tls_verify_host: tls_verify_host,
      blocked_protocol: blocked_protocol,
      blocked_hostname: blocked_hostname,
      blocked_path: blocked_path,

      outbounds: outbounds,

      nat_port: nat_port,
      http_port: http_port,
      https_port: https_port,
      secure_port: secure_port,
      securex_port: securex_port,
      tls_port: tls_port,

      protocol: protocol.join("|"),
      nat_protocol: nat_protocol.join("|"),

      tls_sni: sni,
      port_range: port_range,
      reseved_port: reseved_port,
      reseved_target_port: reseved_target_port,
      note: note,

      permissions: permission,
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg(response.Msg);
        add.close();
        load_nodes();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#add_cancel").on("click", function () {
  add.close();
});

function info_node(node) {
  var name = "";
  $("#info_id").html(node.id);
  $("#info_name").html(node.name);

  $("#info_addr").html(node.addr);
  $("#info_ips").html(node.assign_ips);
  switch (node.mode) {
    case 1:
      $("#info_mode").html("负载均衡");
      break;
    case 2:
      $("#info_mode").html("故障转移");
      break;
    default:
      $("#info_mode").html("负载均衡");
      break;
  }

  $("#info_secret").html(node.secret);
  if (node.updated == "0001-01-01") $("#info_updated").html("无"); else $("#info_updated").html(node.updated);
  $("#info_traffic").html(node.traffic);
  $("#info_speed").html(node.speed);

  $("#info_icp").prop("checked", node.icp);
  $("#info_firewall").prop("checked", node.firewall);
  $("#info_tls_verify").prop("checked", node.tls_verify);
  $("#info_tls_verify_host").prop("checked", node.tls_verify_host);
  $("#info_blocked_protocol").html(node.blocked_protocol);
  $("#info_blocked_hostname").html(node.blocked_hostname);
  $("#info_blocked_path").html(node.blocked_path);

  $("#info_outbounds").html();
  if (node.outbounds != null) {
    for (name in node.outbounds) {
      $("#info_outbounds").append(name + "=" + node.outbounds[name] + "<br>");
    }
  }

  $("#info_nat_port").html(node.nat_port);
  $("#info_http_port").html(node.http_port);
  $("#info_https_port").html(node.https_port);
  $("#info_secure_port").html(node.secure_port);
  $("#info_securex_port").html(node.securex_port);
  $("#info_tls_port").html(node.tls_port);

  var protocols = node.protocol.split("|")
  $("#info_protocol").empty()
  for (name in protocol) {
    if (protocols.indexOf(name) != -1) $("#info_protocol").append(protocol[name] + "<br>")
  }

  var nat_protocols = node.nat_protocol.split("|")
  $("#info_nat_protocol").empty()
  for (name in protocol) {
    if (nat_protocols.indexOf(name) != -1) $("#info_nat_protocol").append(protocol[name] + "<br>")
  }

  $("#info_permissions").empty()
  for (i in permissions) {
    permission = permissions[i]

    if (permission.nodes.split("|").indexOf(String(node.id)) != -1) $("#info_permissions").append(permission.name + "<br>")
  }

  $("#info_sni").html(node.tls_sni);
  $("#info_port_range").html(node.port_range);
  $("#info_reseved_port").html(node.reseved_port);
  $("#info_reseved_target_port").html(node.reseved_target_port);
  $("#info_note").html(node.note);

  info.open();
}

$("#info_close").on('click', function () {
  info.close();
})

$("#add_outbound").on("click", function () {
  var i = 0;
  for (i = 0; $(`[outbound=${i}]`).length > 0; i++) { }

  var html = `
<li outbound="${i}" class="mdui-list-item">
  <div class="mdui-list-item mdui-textfield">
      <input outbound="${i}" class="mdui-textfield-input" type="text" data-type="name" placeholder="名称" />
  </div>
  <div class="mdui-list-item mdui-textfield">
      <input outbound="${i}" class="mdui-textfield-input" type="text" data-type="ip" placeholder="1.2.3.4" />
  </div>
  <button outbound="${i}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
      <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
  </button>
</li>`;
  $("#tag_add_outbounds").append(html);

  $(`button[outbound="${i}"]`).on("click", null, i, function (event) {
    $(`li[outbound="${event.data}"]`).remove();
  });


  mdui.mutation()
  mdui.updateTextFields()
});

$("#edit_outbound").on("click", function () {
  var i = 0;
  for (i = 0; $(`[outbound=${i}]`).length > 0; i++) { }

  var html = `
<li outbound="${i}" class="mdui-list-item">
  <div class="mdui-list-item mdui-textfield">
      <input outbound="${i}" class="mdui-textfield-input" type="text" data-type="name" placeholder="名称" />
  </div>
  <div class="mdui-list-item mdui-textfield">
      <input outbound="${i}" class="mdui-textfield-input" type="text" data-type="ip" placeholder="1.2.3.4" />
  </div>
  <button outbound="${i}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
      <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
  </button>
</li>`;
  $("#tag_edit_outbounds").append(html);

  $(`button[outbound="${i}"]`).on("click", null, i, function (event) {
    $(`li[outbound="${event.data}"]`).remove();
  });

  mdui.mutation()
  mdui.updateTextFields()
});

function edit_node(id) {
  $.ajax({
    method: "GET",
    url: "/ajax/admin/node?id=" + id,
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        node = response.Data;
        nodes[node.id] = node;

        $("#edit_id").html(node.id);
        $("#edit_name").val(node.name);

        $("#edit_addr").val(node.addr);
        $("#edit_ips").val(node.assign_ips);
        $("#edit_mode")
          .find("option[value=" + node.mode + "]")
          .prop("selected", true);
        $("#edit_traffic").val(node.traffic);
        $("#edit_speed").val(node.speed);

        $("#edit_icp").prop("checked", node.icp);
        $("#edit_firewall").prop("checked", node.firewall);
        $("#edit_tls_verify").prop("checked", node.tls_verify);
        $("#edit_tls_verify_host").prop("checked", node.tls_verify_host);
        $("#edit_blocked_protocol").val(node.blocked_protocol);
        $("#edit_blocked_hostname").val(node.blocked_hostname);
        $("#edit_blocked_path").val(node.blocked_path);

        $("#edit_nat_port").val(node.nat_port);
        $("#edit_http_port").val(node.http_port);
        $("#edit_https_port").val(node.https_port);
        $("#edit_secure_port").val(node.secure_port);
        $("#edit_securex_port").val(node.securex_port);
        $("#edit_tls_port").val(node.tls_port);

        $("#tag_add_outbounds").empty();
        $("#tag_edit_outbounds").empty();

        if (node.outbounds != null) {
          var i = 0
          for (name in node.outbounds) {
            var html = `
            <li outbound="${i}" class="mdui-list-item">
              <div class="mdui-list-item mdui-textfield">
                  <input outbound="${i}" class="mdui-textfield-input" type="text" data-type="name" placeholder="名称" />
              </div>
              <div class="mdui-list-item mdui-textfield">
                  <input outbound="${i}" class="mdui-textfield-input" type="text" data-type="ip" placeholder="1.2.3.4" />
              </div>
              <button outbound="${i}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
                  <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
              </button>
            </li>`;

            $("#tag_edit_outbounds").append(html);
            $(`input[outbound="${i}"][data-type=name]`).val(name);

            $(`input[outbound="${i}"][data-type=ip]`).val(node.outbounds[name]);

            $(`button[outbound="${i}"]`).on("click", null, i, function (event) {
              $(`li[outbound="${event.data}"]`).remove();
            });

            i += 1;
          }
        }

        $("input[type=checkbox][data-type=edit-permissions]").each(function (_, item) {
          if (permissions[Number($(this).attr("data-permission"))].nodes.split("|").indexOf(String(node.id)) == -1) item.checked = false; else item.checked = true
        });

        var protocols = node.protocol.split("|");
        $("input[type=checkbox][data-type=edit-protocol]").each(function (_, item) {
          if (protocols.indexOf($(this).attr("protocol")) == -1) item.checked = false; else item.checked = true
        });

        var nat_protocols = node.nat_protocol.split("|");
        $("input[type=checkbox][data-type=edit-nat-protocol]").each(function (_, item) {
          if (nat_protocols.indexOf($(this).attr("protocol")) == -1) item.checked = false; else item.checked = true
        });

        $("#edit_sni").val(node.tls_sni);
        $("#edit_port_range").val(node.port_range);
        $("#edit_reseved_port").val(node.reseved_port);
        $("#edit_reseved_target_port").val(node.reseved_target_port);
        $("#edit_note").val(node.note);

        mdui.mutation()
        mdui.updateTextFields()

        edit.open();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
}

$("#edit_enter").on("click", function () {
  var id = $("#edit_id").html();
  var name = $("#edit_name").val();

  var addr = $("#edit_addr").val();
  var assign_ips = $("#edit_ips").val();
  var mode = Number($("#edit_mode option:selected").val());
  var traffic = Number($("#edit_traffic").val());
  var speed = Number($("#edit_speed").val());

  var icp = $("#edit_icp").prop("checked");
  var firewall = $("#edit_firewall").prop("checked");
  var tls_verify = $("#edit_tls_verify").prop("checked");
  var tls_verify_host = $("#edit_tls_verify_host").prop("checked");
  var blocked_protocol = $("#edit_blocked_protocol").val();
  var blocked_hostname = $("#edit_blocked_hostname").val();
  var blocked_path = $("#edit_blocked_path").val();

  var outbounds = {};

  var nat_port = Number($("#edit_nat_port").val());
  var http_port = Number($("#edit_http_port").val());
  var https_port = Number($("#edit_https_port").val());
  var secure_port = Number($("#edit_secure_port").val());
  var securex_port = Number($("#edit_securex_port").val());
  var tls_port = Number($("#edit_tls_port").val());

  $("input[outbound][data-type=name]").each(function (index, item) {
    if (!item.value) {
      sendmsg("请填完所有选项");
      return;
    }

    var ip = $("input[outbound=" + index + "][data-type=ip]").val();
    outbounds[item.value] = ip;
  });

  var protocol = []
  $("input[type=checkbox][data-type=edit-protocol]").each(function (_, item) {
    if (item.checked) protocol.push($(this).attr("protocol"))
  });

  var nat_protocol = [];
  $("input[type=checkbox][data-type=edit-nat-protocol]").each(function (_, item) {
    if (item.checked) nat_protocol.push($(this).attr("protocol"))
  });

  var permission = [];
  $("input[type=checkbox][data-type=edit-permissions]").each(function (_, item) {
    if (item.checked) permission.push(Number($(this).attr("data-permission")))
  });

  var sni = $("#edit_sni").val();
  var port_range = $("#edit_port_range").val();
  var reseved_port = $("#edit_reseved_port").val();
  var reseved_target_port = $("#edit_reseved_target_port").val();
  var note = $("#edit_note").val();

  if (!id) {
    return;
  }

  if (!name || !addr || !port_range || !sni) {
    sendmsg("请填写名称, 节点地址, 端口范围, TLS隧道SNI");
    return;
  }

  $.ajax({
    method: "PUT",
    url: "/ajax/admin/node?id=" + id,
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,

      addr: addr,
      assign_ips: assign_ips,
      mode: mode,
      traffic: traffic,
      speed: speed,

      icp: icp,
      firewall: firewall,
      tls_verify: tls_verify,
      tls_verify_host: tls_verify_host,
      blocked_protocol: blocked_protocol,
      blocked_hostname: blocked_hostname,
      blocked_path: blocked_path,

      outbounds: outbounds,

      nat_port: nat_port,
      http_port: http_port,
      https_port: https_port,
      secure_port: secure_port,
      securex_port: securex_port,
      tls_port: tls_port,

      protocol: protocol.join("|"),
      nat_protocol: nat_protocol.join("|"),

      tls_sni: sni,
      port_range: port_range,
      reseved_port: reseved_port,
      reseved_target_port: reseved_target_port,
      note: note,

      permissions: permission,
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg(response.Msg);
        edit.close();
        load_permissions();
        load_nodes();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#edit_cancel").on("click", function () {
  edit.close();
});

function delete_node(id) {
  mdui.confirm("删除后无法被恢复", "确认删除", function () {
    $.ajax({
      method: "DELETE",
      url: "/ajax/admin/node?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg("删除成功");
          load_nodes();
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function update_node(id) {
  mdui.confirm("确定升级后端吗?", "确认升级", function () {
    $.ajax({
      method: "GET",
      url: "/ajax/admin/node/update?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        sendmsg(response.Msg)
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}


function copy_script(id, secret) {
  if (settings.license == "") {
    sendmsg("请先去设置填写授权码");
    return;
  }

  var clipboard = new ClipboardJS(`#copy_${id}`, {
    text: function () {
      return `bash <(curl -sSL "https://gitlab.com/CoiaPrant/PortForwardGo/-/raw/master/scripts/install.sh") --api ${window.location.host} --secret ${secret} --license ${settings.license}`;
    }
  })

  clipboard.on('success', function (e) {
    sendmsg("复制成功");
  })

  clipboard.on('error', function (e) {
    sendmsg("复制失败");
  })
}

function load_nodes() {
  $("#node_list").empty();
  nodes = [];

  search = $("#search").val();

  $.ajax({
    method: "GET",
    url: "/ajax/admin/node",
    dataType: "json",
    async: false,
  })
    .done(function (response) {
      if (response.Ok) {
        for (i in response.Data) {
          var node = response.Data[i];
          nodes[node.id] = node;

          if (search != "" && node.name.indexOf(search) == -1 && String(node.id).indexOf(search) == -1) continue;

          if (node.updated == "0001-01-01 00:00") node.updated = "无";

          var html = `<tr>
          <td>${node.id}</td>
          <td>${node.name}</td>
          <td>${node.addr}</td>
          <td>${node.secret}</td>
          <td>${node.updated}</td>
          <td>
          <span id="info_${node.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
            <i class="mdui-icon material-icons">info_outline</i>
          </span>
          <span id="edit_${node.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '修改'}">
            <i class="mdui-icon material-icons">edit</i>
          </span>
          <span id="delete_${node.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
            <i class="mdui-icon material-icons">delete</i>
          </span>
          <span id="update_${node.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '升级'}">
            <i class="mdui-icon material-icons">update</i>
          </span>
          <span id="copy_${node.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '复制对接命令'}">
            <i class="mdui-icon material-icons">content_copy</i>
          </span>
        </td></tr>`;
          $("#node_list").append(html);

          $(`#info_${node.id}`).on("click", null, node, function (event) {
            info_node(event.data);
          });

          $(`#edit_${node.id}`).on("click", null, node.id, function (event) {
            edit_node(event.data);
          });

          $(`#delete_${node.id}`).on("click", null, node.id, function (event) {
            delete_node(event.data);
          });

          $(`#update_${node.id}`).on("click", null, node.id, function (event) {
            update_node(event.data);
          });

          $(`#copy_${node.id}`).on("click", null, { id: node.id, secret: node.secret }, function (event) {
            copy_script(event.data.id, event.data.secret);
          });
        }

        mdui.updateTables("#node_table");
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

function load_permissions() {
  permissions = [];
  $("#tag_add_permissions").empty();
  $("#tag_edit_permissions").empty();

  $.ajax({
    method: "GET",
    url: "/ajax/admin/permission",
    dataType: "json",

  })
    .done(function (response) {
      if (response.Ok) {
        for (i in response.Data) {
          var permission = response.Data[i];
          permissions[permission.id] = permission;

          $("#tag_add_permissions").append(
            `<li class="mdui-list-item mdui-row">
              <div class="mdui-col-xs-3">${permission.name}</div>
              <label class="mdui-list-item mdui-switch">
                <input data-type="add-permissions" data-permission="${permission.id}" type="checkbox" />
                <i class="mdui-switch-icon"></i>
              </label>
             </li>`);

          $("#tag_edit_permissions").append(
            `<li class="mdui-list-item mdui-row">
              <div class="mdui-col-xs-3">${permission.name}</div>
              <label class="mdui-list-item mdui-switch">
                <input data-type="edit-permissions" data-permission="${permission.id}" type="checkbox" />
                <i class="mdui-switch-icon"></i>
              </label>
            </li>`);
        }
        load_nodes();
        done();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

$("#search").keyup(function () {
  $("#node_list").empty();

  search = $("#search").val();

  for (id in nodes) {
    var node = nodes[id]

    if (search != "" && node.name.indexOf(search) == -1 && String(node.id).indexOf(search) == -1) continue;

    if (node.updated == "0001-01-01 00:00") node.updated = "无";

    var html = `<tr>
          <td>${node.id}</td>
          <td>${node.name}</td>
          <td>${node.addr}</td>
          <td>${node.secret}</td>
          <td>${node.updated}</td>
          <td>
          <span id="info_${node.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
            <i class="mdui-icon material-icons">info_outline</i>
          </span>
          <span id="edit_${node.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '修改'}">
            <i class="mdui-icon material-icons">edit</i>
          </span>
          <span id="delete_${node.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
            <i class="mdui-icon material-icons">delete</i>
          </span>
          <span id="update_${node.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '升级'}">
            <i class="mdui-icon material-icons">update</i>
          </span>
          <span id="copy_${node.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '复制对接命令'}">
            <i class="mdui-icon material-icons">content_copy</i>
          </span>
        </td></tr>`;
    $("#node_list").append(html);

    $(`#info_${node.id}`).on("click", null, node, function (event) {
      info_node(event.data);
    });

    $(`#edit_${node.id}`).on("click", null, node.id, function (event) {
      edit_node(event.data);
    });

    $(`#delete_${node.id}`).on("click", null, node.id, function (event) {
      delete_node(event.data);
    });

    $(`#update_${node.id}`).on("click", null, node.id, function (event) {
      update_node(event.data);
    });

    $(`#copy_${node.id}`).on("click", null, { id: node.id, secret: node.secret }, function (event) {
      copy_script(event.data.id, event.data.secret);
    });
  }

  mdui.updateTables("#node_table");
})


$.ajax({
  method: "GET",
  url: "/ajax/admin/settings",
  dataType: "json",

})
  .done(function (response) {
    if (response.Ok) {
      settings = response.Data;
      load_permissions();
    } else sendmsg(response.Msg);
  })
  .fail(function () {
    sendmsg("未能获取服务器数据, 请检查网络是否正常");
  });


