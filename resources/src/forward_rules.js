var domparser = new DOMParser();
var statistics = [];
var nodes = [];
var devices = [];
var user = [];
var rules = [];

var infoRule = new mdui.Dialog("#infoRule");
var newRule = new mdui.Dialog("#addRule");
var newRules = new mdui.Dialog("#addRules");
var editRule = new mdui.Dialog("#editRule");
var debugRule = new mdui.Dialog("#debugRule");

var protocol = {
  tcpudp: "TCP+UDP",
  http: "HTTP",
  https: "HTTPS",
  host: "TLS HOST",
  secure: "Secure隧道",
  securex: "SecureX隧道",
  tls: "TLS隧道",
};

var Status = {
  Created: '<strong class="mdui-text-color-light-blue">待创建</strong>',
  Sync: '<strong class="mdui-text-color-light-blue">待同步</strong>',
  Disabled: '<strong class="mdui-text-color-grey">停用</strong>',
  Suspend: '<strong class="mdui-text-color-orange">已暂停</strong>',
  Active: '<strong class="mdui-text-color-green">正常</strong>',
  Error: '<strong class="mdui-text-color-red">创建失败</strong>',
  Exhaust: '<strong class="mdui-text-color-red">超流量</strong>',
};

var errorCodes = [
  "无",

  "监听失败",
  "连接目标失败",

  "无效的客户端请求",
  "无效的服务器响应",

  "SNI为空",
  "使用了特殊的TLS设置",
  "无效的TLS服务器证书",

  "达到账户限制",
  "初始化错误",

  "协议已被管理员禁用",
  "SNI包含已被管理员禁用的敏感字符",
  "Path包含已被管理员禁用的敏感字符",
];

$("#node-select").on('change', function () {
  var node_id = $("#node-select option:selected").val();

  if (node_id == 0) {
    if (user.speed == 0) $("#speed_limit").html("不限速"); else $("#speed_limit").html("套餐限速 " + (user.speed) + " Mbps (" + (user.speed / 8).toFixed(1) + "M/s)");
  } else {
    node = nodes[node_id];

    speed = (user.speed * node.speed).toFixed();
    if (speed == 0) $("#speed_limit").html("不限速"); else $("#speed_limit").html("限速 " + (speed) + " Mbps (" + (speed / 8).toFixed(1) + "M/s)");
  }

  reload_rules();
})

$("#newrule").on("click", function () {
  $("#add_name").val("");
  $("#add_bind").val("");

  $("#add_mode option:selected").removeAttr("selected");
  $("#add_node option:selected").removeAttr("selected");
  $("#add_nodeinfo").empty();
  $("#add_dest option:selected").removeAttr("selected");
  $("#add_outbound option:selected").removeAttr("selected");
  $("#add_proxyprotocol option:selected").removeAttr("selected");
  $("#add_protocol option:selected").removeAttr("selected");

  $("#tag_add_dest").attr("style", "display: none;");

  $("#tag_add_targets").empty();
  $("#tag_edit_targets").empty();
  $("#tag_add_conf").empty();
  $("#tag_adds_conf").empty();
  $("#tag_edit_conf").empty();

  mdui.mutation()
  mdui.updateTextFields()

  newRule.open();
});

$("#newrules").on("click", function () {
  $("#adds_node option:selected").removeAttr("selected");
  $("#adds_nodeinfo").empty();
  $("#adds_data").val("");
  $("#adds_dest option:selected").removeAttr("selected");
  $("#adds_outbound option:selected").removeAttr("selected");
  $("#adds_proxyprotocol option:selected").removeAttr("selected");
  $("#adds_protocol option:selected").removeAttr("selected");

  $("#tag_adds_dest").attr("style", "display: none;");

  $("#tag_add_conf").empty();
  $("#tag_adds_conf").empty();
  $("#tag_edit_conf").empty();

  mdui.mutation()
  mdui.updateTextFields()

  newRules.open();
});

$("#add_node").on("change", function () {
  $("#add_nodeinfo").empty();
  var node = $("#add_node option:selected").val();

  $("#add_outbound").html(`<option value="">系统默认</option>`);
  if (node == 0) {
    return;
  }

  if (nodes[node] == null) {
    return;
  }

  if (nodes[node].outbounds != null && nodes[node].outbounds.length > 0) {
    for (i in nodes[node].outbounds) {
      var outbound = nodes[node].outbounds[i];
      $("#add_outbound").append(`<option value="${outbound}">${outbound}</option>`);
    }
  }

  var protocols = nodes[node].protocol.split("|");
  $("#add_protocol").find("option").each(function () {
    if ($(this).val() == "none") {
      return;
    }

    if (protocols.indexOf($(this).val()) == -1) {
      $(this).attr("style", "display: none;")
      $(this).attr("disabled", true)
      return;
    }

    $(this).removeAttr("style")
    $(this).removeAttr("disabled")
  })

  $("#add_protocol option:selected").removeAttr("selected");

  $("#add_nodeinfo").append("端口范围 " + nodes[node].port_range)

  if (nodes[node].reseved_ports != "") {
    $("#add_nodeinfo").append("<br>");
    $("#add_nodeinfo").append("保留端口 " + nodes[node].reseved_ports.replaceAll("\n", ","))
  }

  if (nodes[node].reseved_target_ports != "") {
    $("#add_nodeinfo").append("<br>");
    $("#add_nodeinfo").append("保留目标端口 " + nodes[node].reseved_target_ports.replaceAll("\n", ","))
  }

  if (nodes[node].icp) {
    $("#add_nodeinfo").append("<br>");
    $("#add_nodeinfo").append("此节点HTTP/HTTPS转发需要备案域名")
  }

  if (nodes[node].tls_verify) {
    $("#add_nodeinfo").append("<br>");
    $("#add_nodeinfo").append("此节点所有TLS流量需要可信证书")
  }

  if (nodes[node].tls_verify_host) {
    $("#add_nodeinfo").append("<br>");
    $("#add_nodeinfo").append("此节点 HTTPS / TLS HOST 转发需要可信证书")
  }

  if (nodes[node].blocked_protocol != "") {
    $("#add_nodeinfo").append("<br>");
    $("#add_nodeinfo").append("屏蔽协议 " + nodes[node].blocked_protocol)
  }

  if (nodes[node].blocked_hostname != "") {
    $("#add_nodeinfo").append("<br>");
    $("#add_nodeinfo").append("屏蔽SNI " + nodes[node].blocked_hostname)
  }

  if (nodes[node].blocked_path != "") {
    $("#add_nodeinfo").append("<br>");
    $("#add_nodeinfo").append("屏蔽Path " + nodes[node].blocked_path)
  }

  if (nodes[node].note != "") {
    $("#add_nodeinfo").append("<br><br>");
    $("#add_nodeinfo").append("说明 " + nodes[node].note)
  }
})

$("#adds_node").on("change", function () {
  $("#adds_nodeinfo").empty();
  var node = $("#adds_node option:selected").val();

  $("#adds_outbound").html(`<option value="">系统默认</option>`);
  if (node == 0) {
    return;
  }

  if (nodes[node] == null) {
    return;
  }

  if (nodes[node].outbounds != null && nodes[node].outbounds.length > 0) {
    for (i in nodes[node].outbounds) {
      var outbound = nodes[node].outbounds[i];
      $("#adds_outbound").append(`<option value="${outbound}">${outbound}</option>`);
    }
  }

  var protocols = nodes[node].protocol.split("|");
  $("#adds_protocol").find("option").each(function () {
    if ($(this).val() == "none") {
      return;
    }

    if (protocols.indexOf($(this).val()) == -1) {
      $(this).attr("style", "display: none;")
      $(this).attr("disabled", true)
      return;
    }

    $(this).removeAttr("style")
    $(this).removeAttr("disabled")
  })

  $("#adds_protocol option:selected").removeAttr("selected");

  $("#adds_nodeinfo").append("端口范围 " + nodes[node].port_range)

  if (nodes[node].reseved_ports != "") {
    $("#adds_nodeinfo").append("<br>");
    $("#adds_nodeinfo").append("保留端口 " + nodes[node].reseved_ports.replaceAll("\n", ","))
  }

  if (nodes[node].reseved_target_ports != "") {
    $("#adds_nodeinfo").append("<br>");
    $("#adds_nodeinfo").append("保留目标端口 " + nodes[node].reseved_target_ports.replaceAll("\n", ","))
  }

  if (nodes[node].tls_verify) {
    $("#adds_nodeinfo").append("<br>");
    $("#adds_nodeinfo").append("此节点所有TLS流量需要可信证书")
  }

  if (nodes[node].tls_verify_host) {
    $("#adds_nodeinfo").append("<br>");
    $("#adds_nodeinfo").append("此节点TLS HOST需要可信证书")
  }

  if (nodes[node].blocked_protocol != "") {
    $("#adds_nodeinfo").append("<br>");
    $("#adds_nodeinfo").append("屏蔽协议 " + nodes[node].blocked_protocol)
  }

  if (nodes[node].blocked_hostname != "") {
    $("#adds_nodeinfo").append("<br>");
    $("#adds_nodeinfo").append("屏蔽SNI " + nodes[node].blocked_hostname)
  }

  if (nodes[node].blocked_path != "") {
    $("#adds_nodeinfo").append("<br>");
    $("#adds_nodeinfo").append("屏蔽Path " + nodes[node].blocked_path)
  }

  if (nodes[node].note != "") {
    $("#adds_nodeinfo").append("<br><br>");
    $("#adds_nodeinfo").append("说明 " + nodes[node].note)
  }
})

$("#add_enter").on("click", function () {
  var name = $("#add_name").val();
  var node = Number($("#add_node option:selected").val());
  var protocol = $("#add_protocol option:selected").val();
  var bind = $("#add_bind").val();

  var mode = Number($("#add_mode option:selected").val());
  var targets = [];
  var outbound = $("#add_outbound option:selected").val();
  var proxy_protocol = Number($("#add_proxyprotocol option:selected").val());

  var dest_node = 0;
  var dest_device = 0;
  var config = {};

  if (node == 0) {
    sendmsg("请填完所有选项");
    return;
  }

  $("input[conf]").each(function () {
    if (!$(this).val()) {
      sendmsg("请填完所有选项");
      return;
    }

    var key = $(this).attr("conf");
    config[key] = $(this).val();
  });

  $("input[target][type=text]").each(function (index, item) {
    if (!item.value) {
      sendmsg("请填完所有选项");
      return;
    }

    var port = Number($("input[target=" + index + "][type=number]").val());
    if (!port || port < 1 || port > 65535) {
      sendmsg("端口不能为空 且需要在 1~65535 内");
      return;
    }

    targets.push({
      Host: item.value,
      Port: port,
    });
  });

  var dest = Number($("#add_dest option:selected").val());
  switch (protocol) {
    case "none":
      sendmsg("请填完所有选项");
      return;

    case "http": case "https":
      if (!bind) {
        sendmsg("请填完所有选项");
        return;
      }
      break;

    case "secure": case "securex": case "tls":
      if (!dest) {
        sendmsg("请选择出口节点");
        return;
      }

      switch ($("#add_dest option:selected").attr("data-type")) {
        case "node":
          dest_node = dest;
          break;
        case "device":
          dest_device = dest;
          break;
        default:
          sendmsg("出口节点不可用");
          return;
      }
      break;
  }

  $.ajax({
    method: "POST",
    url: "/ajax/forward_rule",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,
      mode: mode,
      protocol: protocol,
      bind: bind,
      targets: targets,
      outbound: outbound,
      proxy_protocol: proxy_protocol,
      conf: config,

      node_id: node,
      dest_node: dest_node,
      dest_device: dest_device,
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg("添加成功");
        newRule.close();
        load_rules();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#adds_enter").on("click", function () {
  var data = $("#adds_data").val();

  var node = Number($("#adds_node option:selected").val());
  var protocol = $("#adds_protocol option:selected").val();

  var outbound = $("#adds_outbound option:selected").val();
  var proxy_protocol = Number($("#adds_proxyprotocol option:selected").val());

  var dest_node = 0;
  var dest_device = 0;
  var config = {};

  if (node == 0 || !data) {
    sendmsg("请填完所有选项");
    return;
  }

  $("input[conf]").each(function () {
    if (!$(this).val()) {
      sendmsg("请填完所有选项");
      return;
    }

    var key = $(this).attr("conf");
    config[key] = $(this).val();
  });

  var dest = Number($("#adds_dest option:selected").val());
  switch (protocol) {
    case "none":
      sendmsg("请填完所有选项");
      return;

    case "http": case "https":
      if (!bind) {
        sendmsg("请填完所有选项");
        return;
      }
      break;

    case "secure": case "securex": case "tls":
      if (!dest) {
        sendmsg("请选择出口节点");
        return;
      }

      switch ($("#adds_dest option:selected").attr("data-type")) {
        case "node":
          dest_node = dest;
          break;
        case "device":
          dest_device = dest;
          break;
        default:
          sendmsg("出口节点不可用");
          return;
      }
      break;
  }

  var close = true;
  var lines = data.split("\n");
  for (i in lines) {
    var line = lines[i].split("#");

    if (line.length != 4) continue;

    $.ajax({
      method: "POST",
      url: "/ajax/forward_rule",
      dataType: "json",
      contentType: "application/json",
      async: false,
      data: JSON.stringify({
        name: line[0],
        mode: 0,
        protocol: protocol,
        bind: line[1],
        targets: [{ Host: line[2], Port: Number(line[3]) }],
        outbound: outbound,
        proxy_protocol: proxy_protocol,
        conf: config,

        node_id: node,
        dest_node: dest_node,
        dest_device: dest_device,
      }),
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg("添加成功");
        } else {
          close = false
          sendmsg(`第${i + 1}行: ` + response.Msg);
        }
      })
      .fail(function () {
        close = false
        sendmsg(`第${i + 1}行: 请求失败, 请检查网络是否正常`);
      });
  }
  load_rules();
  if (close) newRules.close();
});

$("#add_cancel").on("click", function () {
  newRule.close();
});

$("#adds_cancel").on("click", function () {
  newRules.close();
});

$("#add_target").on("click", function () {
  var i = 0;
  for (i = 0; $(`[target=${i}]`).length > 0; i++) { }

  var html = `
<li target="${i}" class="mdui-list-item">
  <div class="mdui-list-item mdui-textfield" style="padding-left: 0px;">
      <input target="${i}" class="mdui-textfield-input" type="text" placeholder="127.0.0.1" />
  </div>
  <div class="mdui-list-item mdui-textfield" style="padding-left: 0px;">
      <input target="${i}" class="mdui-textfield-input" type="number" min="1" max="65535" placeholder="8080" />
  </div>
  <button target="${i}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
      <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
  </button>
</li>`;
  $("#tag_add_targets").append(html);

  $(`button[target="${i}"]`).on("click", null, i, function (event) {
    $(`li[target="${event.data}"]`).remove();
  });

  mdui.mutation()
  mdui.updateTextFields()
});

$("#add_conf").on("click", function () {
  var conf = $("#add_conf_name").val();
  if (!conf) {
    sendmsg("配置项名称不能为空");
    return;
  }

  if ($(`[conf="${conf}"]`).length > 0) {
    sendmsg("配置项已存在");
    return;
  }

  var html = `
<li conf="${conf}" class="mdui-list-item mdui-row">
  <div class="mdui-list-item mdui-col-xs-3">${conf}</div>
  <div class="mdui-list-item mdui-textfield">
      <input conf="${conf}" class="mdui-textfield-input" type="text" />
  </div>
  <button conf="${conf}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
      <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
  </button>
</li>`;
  $("#tag_add_conf").append(html);

  $(`button[conf="${conf}"]`).on("click", null, conf, function (event) {
    $(`li[conf="${event.data}"]`).remove();
  });

  $("#add_conf_name").val('')

  mdui.mutation()
  mdui.updateTextFields()
});

$("#adds_conf").on("click", function () {
  var conf = $("#adds_conf_name").val();
  if (!conf) {
    sendmsg("配置项名称不能为空");
    return;
  }

  if ($(`[conf="${conf}"]`).length > 0) {
    sendmsg("配置项已存在");
    return;
  }

  var html = `
<li conf="${conf}" class="mdui-list-item mdui-row">
  <div class="mdui-list-item mdui-col-xs-3">${conf}</div>
  <div class="mdui-list-item mdui-textfield">
      <input conf="${conf}" class="mdui-textfield-input" type="text" />
  </div>
  <button conf="${conf}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
      <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
  </button>
</li>`;
  $("#tag_adds_conf").append(html);

  $(`button[conf="${conf}"]`).on("click", null, conf, function (event) {
    $(`li[conf="${event.data}"]`).remove();
  });

  $("#adds_conf_name").val('')

  mdui.mutation()
  mdui.updateTextFields()
});

$("#add_protocol").on("change", function () {
  var protocol = $("#add_protocol option:selected").val();

  switch (protocol) {
    case "secure": case "securex": case "tls":
      $("#tag_add_dest").removeAttr("style");
      break;
    default:
      $("#tag_add_dest").attr("style", "display: none;");
  }

  switch (protocol) {
    case "http": case "https":
      $("#tag_add_bind").html("绑定域名");
      $("#add_bind").prop("placeholder", "example.com");
      break;
    default:
      $("#tag_add_bind").html("监听端口");
      $("#add_bind").prop("placeholder", "留空系统自动分配");
  }
});

$("#adds_protocol").on("change", function () {
  var protocol = $("#adds_protocol option:selected").val();

  switch (protocol) {
    case "secure": case "securex": case "tls":
      $("#tag_adds_dest").removeAttr("style");
      break;
    default:
      $("#tag_adds_dest").attr("style", "display: none;");
  }

  switch (protocol) {
    case "http": case "https":
      $("#tag_adds_bind").html("绑定域名");
      $("#adds_bind").prop("placeholder", "example.com");
      break;
    default:
      $("#tag_adds_bind").html("监听端口");
      $("#adds_bind").prop("placeholder", "留空系统自动分配");
  }
});

function info_rule(rule) {
  $("#info_id").html(rule.id);
  $("#info_name").html(rule.name);

  $("#info_node").html(nodes[rule.node_id].name);
  $("#info_node_addr").html(nodes[rule.node_id].addr);

  $("#info_protocol").html(protocol[rule.protocol]);
  switch (rule.protocol) {
    case "http": case "https":
      $("#tag_info_bind").html("绑定域名");
      break;
    default:
      $("#tag_info_bind").html("监听端口");
      break;
  }
  $("#info_bind").html(rule.bind);

  switch (rule.mode) {
    case 0:
      $("#info_mode").html("单转发");
      break;
    case 1:
      $("#info_mode").html("负载均衡");
      break;
    case 2:
      $("#info_mode").html("故障转移");
      break;
  }

  $("#info_targets").empty();
  for (i in rule.targets) {
    $("#info_targets").append(rule.targets[i].Host + ":" + rule.targets[i].Port + "<br>");
  }

  if (rule.outbound == "") $("#info_outbound").html("系统默认"); else $("#info_outbound").html(rule.outbound);

  switch (rule.proxy_protocol) {
    case 0:
      $("#info_proxy").html("关闭");
      break;
    case 1:
      $("#info_proxy").html("v1");
      break;
    case 2:
      $("#info_proxy").html("v2");
      break;
  }

  $("#tag_info_dest").attr("style", "display: none;");
  if (rule.dest_node != 0) {
    $("#tag_info_dest").removeAttr("style");
    $("#info_dest").html(nodes[rule.dest_node].name);
  }
  if (rule.dest_device != 0) {
    $("#tag_info_dest").removeAttr("style");
    $("#info_dest").html(devices[rule.dest_device].name);
  }

  $("#info_conf").empty();
  if (rule.conf != null) {
    for (key in rule.conf) {
      $("#info_conf").append(key + "=" + rule.conf[key] + "<br>");
    }
  }

  infoRule.open();
}

$("#info_close").on("click", function () {
  infoRule.close();
});

function edit_rule(id) {
  $("#edit_conf").val("");
  $("#tag_add_targets").empty();
  $("#tag_edit_targets").empty();
  $("#tag_add_conf").empty();
  $("#tag_adds_conf").empty();
  $("#tag_edit_conf").empty();

  $.ajax({
    method: "GET",
    url: "/ajax/forward_rule?id=" + id,
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        rule = response.Data;

        $("#edit_id").html(id);
        $("#edit_name").val(rule.name);

        $("#edit_mode option:selected").removeAttr("selected");
        $("#edit_mode")
          .find("option[value=" + rule.mode + "]")
          .prop("selected", true);

        $("#edit_proxyprotocol option:selected").removeAttr("selected");
        $("#edit_proxyprotocol")
          .find("option[value=" + rule.proxy_protocol + "]")
          .prop("selected", true);

        if (rule.targets != null) {
          for (i in rule.targets) {
            var html = `
<li target="${i}" class="mdui-list-item">
  <div class="mdui-list-item mdui-textfield" style="padding-left: 0px;">
      <input target="${i}" class="mdui-textfield-input" type="text" placeholder="127.0.0.1" />
  </div>
  <div class="mdui-list-item mdui-textfield" style="padding-left: 0px;">
      <input target="${i}" class="mdui-textfield-input" type="number" min="1" max="65535" placeholder="8080" />
  </div>
  <button target="${i}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
      <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
  </button>
</li>`;

            $("#tag_edit_targets").append(html);
            $(`input[target="${i}"][type=text]`).val(
              rule.targets[i].Host
            );

            $(`input[target="${i}"][type=number]`).val(
              rule.targets[i].Port
            );

            $(`button[target="${i}"]`).on("click", null, i, function (event) {
              $(`li[target="${event.data}"]`).remove();
            });
          }
        }

        $("#edit_outbound").html(`<option value="">系统默认</option>`);
        if (nodes[rule.node_id].outbounds != null && nodes[rule.node_id].outbounds.length > 0) {
          for (i in nodes[rule.node_id].outbounds) {
            var outbound = nodes[rule.node_id].outbounds[i];
            $("#edit_outbound").append(`<option value="${outbound}">${outbound}</option>`);
          }
        }

        $("#edit_outbound option:selected").removeAttr("selected");
        if (rule.outbound != "") {
          $("#edit_outbound")
            .find("option[value='" + rule.outbound + "']")
            .prop("selected", true);
        }

        if (rule.conf != null) {
          for (key in rule.conf) {
            var html = `
    <li conf="${key}" class="mdui-list-item mdui-row">
      <div class="mdui-list-item mdui-col-xs-3">${key}</div>
      <div class="mdui-list-item mdui-textfield">
        <input conf="${key}" class="mdui-textfield-input" type="text" />
      </div>
      <button conf="${key}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
        <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
      </button>
    </li>`;
            $("#tag_edit_conf").append(html);
            $(`input[conf="${key}"]`).val(rule.conf[key]);

            $(`button[conf="${key}"]`).on("click", null, key, function (event) {
              $(`li[conf="${event.data}"]`).remove();
            });
          }
        }

        mdui.mutation()
        mdui.updateTextFields()

        editRule.open();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
}

$("#edit_enter").on("click", function () {
  var id = $("#edit_id").html();

  var name = $("#edit_name").val();
  var mode = Number($("#edit_mode option:selected").val());
  var outbound = $("#edit_outbound option:selected").val();
  var proxy_protocol = Number($("#edit_proxyprotocol option:selected").val());
  var targets = [];
  var config = {};

  if (!id) {
    return;
  }

  $("input[conf]").each(function () {
    if (!$(this).val()) {
      sendmsg("请填完所有选项");
      return;
    }

    var key = $(this).attr("conf");
    config[key] = $(this).val();
  });

  $("input[target][type=text]").each(function (index, item) {
    if (!item.value) {
      sendmsg("请填完所有选项");
      return;
    }

    var port = Number($("input[target=" + index + "][type=number]").val());
    if (!port || port < 1 || port > 65535) {
      sendmsg("端口不能为空 且需要在 1~65535 内");
      return;
    }

    targets.push({
      Host: item.value,
      Port: port,
    });
  });

  $.ajax({
    method: "PUT",
    url: "/ajax/forward_rule?id=" + id,
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,
      mode: mode,
      targets: targets,
      outbound: outbound,
      proxy_protocol: proxy_protocol,
      conf: config,
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg("修改成功");
        editRule.close();
        load_rules();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#edit_cancel").on("click", function () {
  editRule.close();
});

$("#edit_target").on("click", function () {
  var i = 0;
  for (i = 0; $(`[target=${i}]`).length > 0; i++) { }

  var html = `
<li target="${i}" class="mdui-list-item">
  <div class="mdui-list-item mdui-textfield" style="padding-left: 0px;">
      <input target="${i}" class="mdui-textfield-input" type="text" placeholder="127.0.0.1" />
  </div>
  <div class="mdui-list-item mdui-textfield" style="padding-left: 0px;">
      <input target="${i}" class="mdui-textfield-input" type="number" min="1" max="65535" placeholder="8080" />
  </div>
  <button target="${i}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
      <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
  </button>
</li>`;
  $("#tag_edit_targets").append(html);

  $(`button[target="${i}"]`).on("click", null, i, function (event) {
    $(`li[target="${event.data}"]`).remove();
  });

  mdui.mutation()
  mdui.updateTextFields()
});

$("#edit_conf").on("click", function () {
  var conf = $("#edit_conf_name").val();
  if (!conf) {
    sendmsg("配置项名称不能为空");
    return;
  }

  if ($(`[conf="${conf}"]`).length > 0) {
    sendmsg("配置项已存在");
    return;
  }

  var html = `
  <li conf="${conf}" class="mdui-list-item mdui-row">
    <div class="mdui-list-item mdui-col-xs-3">${conf}</div>
    <div class="mdui-list-item mdui-textfield">
        <input conf="${conf}" class="mdui-textfield-input" type="text" />
    </div>
    <button conf="${conf}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
        <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
    </button>
  </li>`;
  $("#tag_edit_conf").append(html);

  $(`button[conf="${conf}"]`).on("click", null, conf, function (event) {
    $(`li[conf="${event.data}"]`).remove();
  });

  $("#edit_conf_name").val('');

  mdui.mutation()
  mdui.updateTextFields()
});

function delete_rule(id) {
  mdui.confirm("删除后规则无法被恢复", "确认删除", function () {
    $.ajax({
      method: "DELETE",
      url: "/ajax/forward_rule?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg("删除成功");
          load_rules();
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function load_rules() {
  load_statistics();

  rules = [];
  search = $("#search").val();

  $("#rule_list").empty();
  view_node = $("#node-select option:selected").val();

  $.ajax({
    method: "GET",
    url: "/ajax/forward_rule",
    dataType: "json",
    async: false,
  })
    .done(function (response) {
      if (response.Ok) {
        if (response.Data == null) {
          $("#rule_usage").html("规则 0 / " + user.rule + " 条")
          mdui.updateTables("#rule_table");
          return;
        }

        $("#rule_usage").html("规则 " + response.Data.length + " / " + user.rule + " 条")

        for (id in response.Data) {
          var rule = response.Data[id];
          rules[rule.id] = rule

          if (search != "" && rule.name.indexOf(search) == -1 && String(rule.id).indexOf(search) == -1) continue;
          if (view_node != 0 && rule.node_id != view_node && rule.dest_node != view_node) continue;
          if (rule.targets == null) rule.targets = [];

          var traffic_used = '<br><small class="mdui-text-color-grey">已用流量 0 GB</small';
          if (!isNaN(statistics[rule.id])) {
            traffic_used = '<br><small class="mdui-text-color-grey">已用流量 ' + (statistics[rule.id] / 1073741824).toFixed(2).toString() + " GB</small>";
          }

          var mode_text = "";
          switch (rule.mode) {
            case 1:
              mode_text = '<br><small class="mdui-text-color-grey">负载均衡 (共' + rule.targets.length + '个)</small>';
              break;
            case 2:
              mode_text = '<br><small class="mdui-text-color-grey">故障转移 (共' + rule.targets.length + '个)</small>';
              break;
          }

          var status_text = "";
          if (!rule.sync) {
            status_text = `<br><small>${Status["Sync"]}</small>`;
          }

          var outbound_text = "";
          if (rule.dest_node != 0) {
            outbound_text = `<br><small class="mdui-text-color-grey">出口: ${nodes[rule.dest_node].name}</small>`;
          } else if (rule.dest_device != 0) {
            outbound_text = `<br><small class="mdui-text-color-grey">出口: ${devices[rule.dest_device].name}</small>`;
          }

          var html = `<tr id="rule_${rule.id}" data-rule="${rule.id}">
            <td class="mdui-table-cell-checkbox">
              <label class="mdui-checkbox">
                <input type="checkbox">
                <i class="mdui-checkbox-icon"></i>
              </label>
            </td>
            <td>${rule.name}<br><small class="mdui-text-color-grey">#${rule.id}</small></td>
            <td>${nodes[rule.node_id].name}<br><small class="mdui-text-color-grey">${nodes[rule.node_id].addr}</small></td>
            <td>${rule.bind}${traffic_used}</td>`;

          if (rule.targets.length < 1) {
            html += `<td>无${mode_text}</td>`;
          } else {
            html += `<td>${rule.targets[0].Host}:${rule.targets[0].Port}${mode_text}</td>`;
          }

          html += `<td>${protocol[rule.protocol]}${outbound_text}</td>
            <td>${Status[rule.status]}${status_text}</td>`;

          if (rule.status == "Suspend") {
            html += `<td></td></tr>`;

            $("#rule_list").prepend(html);
            continue;
          }

          html += `<td>
            <span id="info_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
              <i class="mdui-icon material-icons">info_outline</i>
            </span>
            <span id="restart_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '重启'}">
              <i class="mdui-icon material-icons">power_settings_new</i>
            </span>
            <span id="stop_${rule.id}" class="mdui-btn mdui-btn-icon" style="display: none;" mdui-tooltip="{content: '暂停'}">
              <i class="mdui-icon material-icons">pause_circle_outline</i>
            </span>
            <span id="start_${rule.id}" class="mdui-btn mdui-btn-icon" style="display: none;" mdui-tooltip="{content: '启用'}">
              <i class="mdui-icon material-icons">play_circle_outline</i>
            </span>
            <span id="copy_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '复制'}">
              <i class="mdui-icon material-icons">content_copy</i>
            </span>
            <span id="edit_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '编辑'}">
              <i class="mdui-icon material-icons">edit</i>
            </span>
            <span id="delete_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
              <i class="mdui-icon material-icons">delete</i>
            </span>
            <span id="debug_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '诊断'}">
              <i class="mdui-icon material-icons">help_outline</i>
            </span>     
          </td></tr>`;
          $("#rule_list").prepend(html);

          switch (rule.status) {
            case "Active":
              $(`#stop_${rule.id}`).removeAttr("style");
              break;
            case "Disabled":
              $(`#start_${rule.id}`).removeAttr("style");
              break;
          }

          $(`#info_${rule.id}`).on("click", null, rule, function (event) {
            info_rule(event.data);
          });

          $(`#restart_${rule.id}`).on("click", null, rule.id, function (event) {
            restart_rule(event.data);
          });

          $(`#start_${rule.id}`).on("click", null, rule.id, function (event) {
            start_rule(event.data);
          });

          $(`#stop_${rule.id}`).on("click", null, rule.id, function (event) {
            stop_rule(event.data);
          });

          $(`#copy_${rule.id}`).on("click", null, rule, function (event) {
            copy_rule(event.data);
          });

          $(`#debug_${rule.id}`).on("click", null, rule.id, function (event) {
            debug_rule(event.data);
          });

          $(`#edit_${rule.id}`).on("click", null, rule.id, function (event) {
            edit_rule(event.data);
          });

          $(`#delete_${rule.id}`).on("click", null, rule.id, function (event) {
            delete_rule(event.data);
          });
        }

        mdui.updateTables("#rule_table");
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

function reload_rules() {
  search = $("#search").val();

  $("#rule_list").empty();
  view_node = $("#node-select option:selected").val();

  for (id in rules) {
    var rule = rules[id];

    if (search != "" && rule.name.indexOf(search) == -1 && String(rule.id).indexOf(search) == -1) continue;
    if (view_node != 0 && rule.node_id != view_node && rule.dest_node != view_node) continue;
    if (rule.targets == null) rule.targets = [];

    var traffic_used = '<br><small class="mdui-text-color-grey">已用流量 0 GB</small';
    if (!isNaN(statistics[rule.id])) {
      traffic_used = '<br><small class="mdui-text-color-grey">已用流量 ' + (statistics[rule.id] / 1073741824).toFixed(2).toString() + " GB</small>";
    }

    var mode_text = "";
    switch (rule.mode) {
      case 1:
        mode_text = '<br><small class="mdui-text-color-grey">负载均衡 (共' + rule.targets.length + '个)</small>';
        break;
      case 2:
        mode_text = '<br><small class="mdui-text-color-grey">故障转移 (共' + rule.targets.length + '个)</small>';
        break;
    }

    var status_text = "";
    if (!rule.sync) {
      status_text = `<br><small>${Status["Sync"]}</small>`;
    }

    var outbound_text = "";
    if (rule.dest_node != 0) {
      outbound_text = `<br><small class="mdui-text-color-grey">出口: ${nodes[rule.dest_node].name}</small>`;
    } else if (rule.dest_device != 0) {
      outbound_text = `<br><small class="mdui-text-color-grey">出口: ${devices[rule.dest_device].name}</small>`;
    }

    var html = `<tr id="rule_${rule.id}" data-rule="${rule.id}">
            <td class="mdui-table-cell-checkbox">
              <label class="mdui-checkbox">
                <input type="checkbox">
                <i class="mdui-checkbox-icon"></i>
              </label>
            </td>
            <td>${rule.name}<br><small class="mdui-text-color-grey">#${rule.id}</small></td>
            <td>${nodes[rule.node_id].name}<br><small class="mdui-text-color-grey">${nodes[rule.node_id].addr}</small></td>
            <td>${rule.bind}${traffic_used}</td>`;

    if (rule.targets.length < 1) {
      html += `<td>无${mode_text}</td>`;
    } else {
      html += `<td>${rule.targets[0].Host}:${rule.targets[0].Port}${mode_text}</td>`;
    }

    html += `<td>${protocol[rule.protocol]}${outbound_text}</td>
            <td>${Status[rule.status]}${status_text}</td>`;

    if (rule.status == "Suspend") {
      html += `<td></td></tr>`;

      $("#rule_list").prepend(html);
      continue;
    }

    html += `<td>
            <span id="info_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
              <i class="mdui-icon material-icons">info_outline</i>
            </span>
            <span id="restart_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '重启'}">
              <i class="mdui-icon material-icons">power_settings_new</i>
            </span>
            <span id="stop_${rule.id}" class="mdui-btn mdui-btn-icon" style="display: none;" mdui-tooltip="{content: '暂停'}">
              <i class="mdui-icon material-icons">pause_circle_outline</i>
            </span>
            <span id="start_${rule.id}" class="mdui-btn mdui-btn-icon" style="display: none;" mdui-tooltip="{content: '启用'}">
              <i class="mdui-icon material-icons">play_circle_outline</i>
            </span>
            <span id="copy_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '复制'}">
              <i class="mdui-icon material-icons">content_copy</i>
            </span>
            <span id="edit_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '编辑'}">
              <i class="mdui-icon material-icons">edit</i>
            </span>
            <span id="delete_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
              <i class="mdui-icon material-icons">delete</i>
            </span>
            <span id="debug_${rule.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '诊断'}">
              <i class="mdui-icon material-icons">help_outline</i>
            </span>     
          </td></tr>`;
    $("#rule_list").prepend(html);

    switch (rule.status) {
      case "Active":
        $(`#stop_${rule.id}`).removeAttr("style");
        break;
      case "Disabled":
        $(`#start_${rule.id}`).removeAttr("style");
        break;
    }

    $(`#info_${rule.id}`).on("click", null, rule, function (event) {
      info_rule(event.data);
    });

    $(`#restart_${rule.id}`).on("click", null, rule.id, function (event) {
      restart_rule(event.data);
    });

    $(`#start_${rule.id}`).on("click", null, rule.id, function (event) {
      start_rule(event.data);
    });

    $(`#stop_${rule.id}`).on("click", null, rule.id, function (event) {
      stop_rule(event.data);
    });

    $(`#copy_${rule.id}`).on("click", null, rule, function (event) {
      copy_rule(event.data);
    });

    $(`#start_${rule.id}`).on("click", null, rule.id, function (event) {
      start_rule(event.data);
    });

    $(`#edit_${rule.id}`).on("click", null, rule.id, function (event) {
      edit_rule(event.data);
    });

    $(`#delete_${rule.id}`).on("click", null, rule.id, function (event) {
      delete_rule(event.data);
    });

    $(`#debug_${rule.id}`).on("click", null, rule.id, function (event) {
      debug_rule(event.data);
    });
  }

  mdui.updateTables("#rule_table");
}

function load_nodes() {
  nodes = [];

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
          nodes[node.id] = node;

          $("#node-select").append(`<option value="${node.id}">${node.name}</option>`);

          switch (node.permission) {
            case 1:
              $("#add_node").append(`<option value="${node.id}">${node.name} (${node.speed}倍速率 ${node.traffic}倍消耗)</option>`);
              $("#adds_node").append(`<option value="${node.id}">${node.name} (${node.speed}倍速率 ${node.traffic}倍消耗)</option>`);
              break;
            case 2:
              $("#add_dest").append(`<option data-type="node" value="${node.id}">${node.name} (${node.speed}倍速率 ${node.traffic}倍消耗)</option>`);
              $("#adds_dest").append(`<option data-type="node" value="${node.id}">${node.name} (${node.speed}倍速率 ${node.traffic}倍消耗)</option>`);
              break;
            case 3:
              $("#add_node").append(`<option value="${node.id}">${node.name}</option>`);
              $("#add_dest").append(`<option data-type="node" value="${node.id}">${node.name} (${node.speed}倍速率 ${node.traffic}倍消耗)</option>`);
              $("#adds_node").append(`<option value="${node.id}">${node.name}</option>`);
              $("#adds_dest").append(`<option data-type="node" value="${node.id}">${node.name} (${node.speed}倍速率 ${node.traffic}倍消耗)</option>`);
              break;
          }
        }

        load_devices();
        load_rules();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

function load_statistics() {
  statistics = [];

  $.ajax({
    method: "GET",
    url: "/ajax/forward_rule/statistics",
    dataType: "json",
    async: false,
  })
    .done(function (response) {
      if (response.Ok) {
        for (i in response.Data) {
          var statistic = response.Data[i];

          if (statistics[statistic.rule_id] == null) {
            statistics[statistic.rule_id] = statistic.traffic;
          } else {
            statistics[statistic.rule_id] += statistic.traffic;
          }
        }
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

function load_devices() {
  devices = [];

  $.ajax({
    method: "GET",
    url: "/ajax/tunnel_device",
    dataType: "json",
    async: false,
  })
    .done(function (response) {
      if (response.Ok) {
        $("#add_dest").append("<option disabled>————————</option>")

        for (i in response.Data) {
          var device = response.Data[i];
          devices[device.id] = device;

          $("#add_dest").append(`<option data-type="device" value="${device.id}">${device.name}</option>`);
          $("#adds_dest").append(`<option data-type="device" value="${device.id}">${device.name}</option>`);
        }

      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

$("#search").keyup(reload_rules);

$("#delete_checked").on('click', function () {
  var success = 0
  var failed = 0
  mdui.confirm("删除后规则无法被恢复", "确认删除", function () {

    $("tr[data-rule]").each(function () {
      var rule_id = $(this).attr("data-rule");
      var checked = $(this).find("td[class=mdui-table-cell-checkbox]").find("label").find("input[type=checkbox]").prop('checked');

      if (!checked || !rule_id) {
        return;
      }

      $.ajax({
        method: "DELETE",
        url: "/ajax/forward_rule?id=" + rule_id,
        dataType: "json",
        async: false,
      }).done(function (response) {
        if (response.Ok) {
          success += 1
        } else failed += 1;
      })
        .fail(function () {
          failed += 1
        });
    });

    sendmsg(`操作完成, 成功${success}个, 失败${failed}个`);
    load_rules();
  });
})

function restart_rule(id) {
  mdui.confirm("真的要重启规则吗?", "询问", function () {
    $.ajax({
      method: "GET",
      url: "/ajax/forward_rule/restart?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg(response.Msg);
          load_rules();
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function start_rule(id) {
  mdui.confirm("真的要恢复规则吗?", "询问", function () {
    $.ajax({
      method: "GET",
      url: "/ajax/forward_rule/start?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg(response.Msg);
          load_rules();
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function stop_rule(id) {
  mdui.confirm("真的要暂停规则吗?", "询问", function () {
    $.ajax({
      method: "GET",
      url: "/ajax/forward_rule/stop?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg(response.Msg);
          load_rules();
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function copy_rule(rule) {
  $("#add_name").val(rule.name);
  $("#add_bind").val(rule.bind);

  $("#add_mode option:selected").removeAttr("selected");
  $("#add_mode")
    .find("option[value=" + rule.mode + "]")
    .prop("selected", true);

  $("#add_node option:selected").removeAttr("selected");
  $("#add_node")
    .find("option[value=" + rule.node + "]")
    .prop("selected", true);

  $("#add_proxyprotocol option:selected").removeAttr("selected");
  $("#add_proxyprotocol")
    .find("option[value=" + rule.proxy_protocol + "]")
    .prop("selected", true);

  $("#add_protocol option:selected").removeAttr("selected");
  $("#add_protocol")
    .find("option[value=" + rule.protocol + "]")
    .prop("selected", true);

  $("#tag_add_dest").attr("style", "display: none;");
  $("#add_dest option:selected").removeAttr("selected");
  if (rule.dest_node != 0) {
    $("#add_dest")
      .find("option[data-type=node][value=" + rule.dest_node + "]")
      .prop("selected", true);
  } else if (rule.dest_device != 0) {
    $("#add_dest")
      .find("option[data-type=device][value=" + rule.dest_device + "]")
      .prop("selected", true);
  }

  $("#tag_add_targets").empty();
  $("#tag_edit_targets").empty();
  $("#tag_add_conf").empty();
  $("#tag_adds_conf").empty();
  $("#tag_edit_conf").empty();

  if (rule.targets != null) {
    for (i in rule.targets) {
      var html = `
<li target="${i}" class="mdui-list-item">
  <div class="mdui-list-item mdui-textfield" style="padding-left: 0px;">
      <input target="${i}" class="mdui-textfield-input" type="text" placeholder="127.0.0.1" />
  </div>
  <div class="mdui-list-item mdui-textfield" style="padding-left: 0px;">
      <input target="${i}" class="mdui-textfield-input" type="number" min="1" max="65535" placeholder="8080" />
  </div>
  <button target="${i}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
      <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
  </button>
</li>`;

      $("#tag_add_targets").append(html);
      $(`input[target="${i}"][type=text]`).val(
        rule.targets[i].Host
      );

      $(`input[target="${i}"][type=number]`).val(
        rule.targets[i].Port
      );

      $(`button[target="${i}"]`).on("click", null, i, function (event) {
        $(`li[target="${event.data}"]`).remove();
      });
    }
  }

  if (rule.conf != null) {
    for (key in rule.conf) {
      var html = `
    <li conf="${key}" class="mdui-list-item mdui-row">
      <div class="mdui-list-item mdui-col-xs-3">${key}</div>
      <div class="mdui-list-item mdui-textfield">
        <input conf="${key}" class="mdui-textfield-input" type="text" />
      </div>
      <button conf="${key}" class="mdui-btn mdui-btn-icon mdui-btn-raised mdui-shadow-4 mdui-color-theme mdui-ripple">
        <i class="mdui-list-item-icon mdui-icon material-icons">delete</i>
      </button>
    </li>`;
      $("#tag_add_conf").append(html);
      $(`input[conf="${key}"]`).val(rule.conf[key]);

      $(`button[conf="${key}"]`).on("click", null, key, function (event) {
        $(`li[conf="${event.data}"]`).remove();
      });

    }
  }

  switch (rule.protocol) {
    case "secure": case "securex": case "tls":
      $("#tag_add_dest").removeAttr("style");
      break;
    default:
      $("#tag_add_dest").attr("style", "display: none;");
  }

  switch (rule.protocol) {
    case "http": case "https":
      $("#tag_add_bind").html("绑定域名");
      $("#add_bind").prop("placeholder", "example.com");
      break;
    default:
      $("#tag_add_bind").html("监听端口");
      $("#add_bind").prop("placeholder", "留空系统自动分配");
  }

  mdui.mutation()
  mdui.updateTextFields()

  newRule.open();
}

function debug_rule(id) {
  $("#debug_id").html(id);

  $("#debug_inbound").empty();
  $("#debug_outbound").empty();

  $.ajax({
    method: "GET",
    url: "/ajax/forward_rule/debug?id=" + id,
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        if (response.InBound == null) {
          $("#debug_inbound").html("入口连接失败");
        } else {
          if (response.InBound.Ok) {
            $("#debug_inbound").append(`后端反馈时间 ${response.InBound.Data.Timestarp}<br>`);
            $("#debug_inbound").append(`上次错误信息 ${errorCodes[response.InBound.Data.Error]}<br>`);
            $("#debug_inbound").append(`<br>`);
            $("#debug_inbound").append(`规则状态 ${response.InBound.Data.Status}<br>`);

            if (response.InBound.Data.MaxConn != 0) $("#debug_inbound").append(`最大连接数 ${response.InBound.Data.MaxConn}<br>`);
            $("#debug_inbound").append(`已连接 ${response.InBound.Data.Connected}<br>`);

            $("#debug_inbound").append(`<br>`);
            $("#debug_inbound").append(`转发目标<br>`);

            for (target in response.InBound.Data.Targets) {
              $("#debug_inbound").append(`&nbsp;- ${target}<br>`);

              if (response.InBound.Data.Targets[target].Ok) {
                for (ip in response.InBound.Data.Targets[target].Data) {
                  $("#debug_inbound").append(`&nbsp;&nbsp;&nbsp;[${ip}]: ${response.InBound.Data.Targets[target].Data[ip]}<br>`);
                }
              } else {
                $("#debug_inbound").append(`&nbsp;Error: ${response.InBound.Data.Targets[target].Error}<br>`);
              }
            }
          } else $("#debug_inbound").html(response.InBound.Data);
        }

        $("#tag_debug_outbound").attr("style", "display: none")
        if (response.ShowOutbound) {
          $("#tag_debug_outbound").removeAttr("style")

          if (response.OutBound == null) {
            $("#debug_outbound").html("出口连接失败");
          } else {
            if (response.OutBound.Ok) {
              $("#debug_outbound").append(`后端反馈时间 ${response.OutBound.Data.Timestarp}<br>`);
              $("#debug_outbound").append(`上次错误信息 ${errorCodes[response.OutBound.Data.Error]}<br>`);
              $("#debug_outbound").append(`<br>`);
              $("#debug_outbound").append(`规则状态 ${response.OutBound.Data.Status}<br>`);

              if (response.OutBound.Data.MaxConn != 0) $("#debug_outbound").append(`最大连接数 ${response.OutBound.Data.MaxConn}<br>`);
              $("#debug_outbound").append(`已连接 ${response.OutBound.Data.Connected}<br>`);

              $("#debug_outbound").append(`<br>`);
              $("#debug_outbound").append(`转发目标<br>`);

              for (target in response.OutBound.Data.Targets) {
                $("#debug_outbound").append(`&nbsp;- ${target}<br>`);

                if (response.OutBound.Data.Targets[target].Ok) {
                  for (ip in response.OutBound.Data.Targets[target].Data) {
                    $("#debug_outbound").append(`&nbsp;&nbsp;&nbsp;[${ip}]: ${response.OutBound.Data.Targets[target].Data[ip]}<br>`);
                  }
                } else {
                  $("#debug_outbound").append(`&nbsp;Error: ${response.OutBound.Data.Targets[target].Error}<br>`);
                }
              }
            } else $("#debug_outbound").html(response.OutBound.Data);
          }
        }

        debugRule.open();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
}

$("#debug_close").on("click", function () {
  debugRule.close();
});

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
      }

      if (user.permission_id == 0) {
        $("#no_plan").removeAttr("style");
      } else {
        $("#view_rule").removeAttr("style");

        $("#traffic_usage").html("流量 " + (user.traffic_used / 1073741824).toFixed(2) + " / " + (user.traffic / 1073741824).toFixed() + " GB")
        if (user.speed == 0) $("#speed_limit").html("不限速"); else $("#speed_limit").html("套餐限速 " + user.speed + " Mbps (" + (user.speed / 8).toFixed(1) + "M/s)");
        if (user.maxconn == 0) $("#conn_limit").html("不限制连接数"); else $("#conn_limit").html("连接数限制 " + user.maxconn);
        if (user.reset_date == "0001-01-01") $("#reset_date").html("一次性"); else $("#reset_date").html("重置时间 " + user.reset_date);
        if (user.expire_date == "0001-01-01") $("#expire_date").html("永久"); else $("#expire_date").html("到期时间 " + user.expire_date);

        load_nodes();
      }

      done();
    } else sendmsg(response.Msg);
  })
  .fail(function () {
    sendmsg("未能获取服务器数据, 请检查网络是否正常");
  });
