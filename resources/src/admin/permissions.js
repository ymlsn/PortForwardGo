var domparser = new DOMParser();
var permissions = [];
var nodes = [];

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

  $("input[type=checkbox][data-type=add-node]").each(function (_, item) {
    item.checked = false
  });

  $("input[type=checkbox][data-type=add-protocol]").each(function (_, item) {
    item.checked = false
  });

  $("input[type=checkbox][data-type=add-nat-protocol]").each(function (_, item) {
    item.checked = false
  });


  mdui.mutation()
  mdui.updateTextFields()

  add.open();
});

$("#add_enter").on("click", function () {
  var name = $("#add_name").val();

  var node = [];
  $("input[type=checkbox][data-type=add-node]").each(function (_, item) {
    if (item.checked) node.push($(this).attr("data-node"))
  });

  var protocol = []
  $("input[type=checkbox][data-type=add-protocol]").each(function (_, item) {
    if (item.checked) protocol.push($(this).attr("protocol"))
  });

  var nat_protocol = [];
  $("input[type=checkbox][data-type=add-nat-protocol]").each(function (_, item) {
    if (item.checked) nat_protocol.push($(this).attr("protocol"))
  });

  $.ajax({
    method: "POST",
    url: "/ajax/admin/permission",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,

      nodes: node.join("|"),
      protocol: protocol.join("|"),
      nat_protocol: nat_protocol.join("|"),
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg(response.Msg);
        add.close();
        load_permissions();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#add_cancel").on("click", function () {
  add.close();
});

function info_permission(permission) {
  var name = ""

  $("#info_id").html(permission.id)
  $("#info_name").html(permission.name);

  var nodelist = permission.nodes.split("|")
  $("#info_node").empty()
  for (i in nodes) {
    var node = nodes[i]
    if (nodelist.indexOf(String(node.id)) != -1) $("#info_node").append(node.name + "<br>")
  }

  var protocols = permission.protocol.split("|")
  $("#info_protocol").empty()
  for (name in protocol) {
    if (protocols.indexOf(name) != -1) $("#info_protocol").append(protocol[name] + "<br>")
  }

  var nat_protocols = permission.nat_protocol.split("|")
  $("#info_nat_protocol").empty()
  for (name in protocol) {
    if (nat_protocols.indexOf(name) != -1) $("#info_nat_protocol").append(protocol[name] + "<br>")
  }

  info.open();
}

$("#info_close").on('click', function () {
  info.close();
})

function edit_permission(id) {
  $.ajax({
    method: "GET",
    url: "/ajax/admin/permission?id=" + id,
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        permission = response.Data;
        permissions[permission.id] = permission;

        $("#edit_id").html(permission.id);
        $("#edit_name").val(permission.name);

        var node = permission.nodes.split("|");
        $("input[type=checkbox][data-type=edit-node]").each(function (_, item) {
          if (node.indexOf($(this).attr("data-node")) == -1) item.checked = false; else item.checked = true
        });

        var protocols = permission.protocol.split("|");
        $("input[type=checkbox][data-type=edit-protocol]").each(function (_, item) {
          if (protocols.indexOf($(this).attr("protocol")) == -1) item.checked = false; else item.checked = true
        });

        var nat_protocols = permission.nat_protocol.split("|");
        $("input[type=checkbox][data-type=edit-nat-protocol]").each(function (_, item) {
          if (nat_protocols.indexOf($(this).attr("protocol")) == -1) item.checked = false; else item.checked = true
        });

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

  var node = [];
  $("input[type=checkbox][data-type=edit-node]").each(function (_, item) {
    if (item.checked) node.push($(this).attr("data-node"))
  });

  var protocol = []
  $("input[type=checkbox][data-type=edit-protocol]").each(function (_, item) {
    if (item.checked) protocol.push($(this).attr("protocol"))
  });

  var nat_protocol = [];
  $("input[type=checkbox][data-type=edit-nat-protocol]").each(function (_, item) {
    if (item.checked) nat_protocol.push($(this).attr("protocol"))
  });

  if (!id) {
    return;
  }

  $.ajax({
    method: "PUT",
    url: "/ajax/admin/permission?id=" + id,
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,

      nodes: node.join("|"),
      protocol: protocol.join("|"),
      nat_protocol: nat_protocol.join("|"),
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg(response.Msg);
        edit.close();
        load_permissions();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#edit_cancel").on("click", function () {
  edit.close();
});

function delete_permission(id) {
  mdui.confirm("删除后无法被恢复", "确认删除", function () {
    $.ajax({
      method: "DELETE",
      url: "/ajax/admin/permission?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg("删除成功");
          load_permissions();
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function load_nodes() {
  nodes = [];

  $.ajax({
    method: "GET",
    url: "/ajax/admin/node",
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        for (i in response.Data) {
          var node = response.Data[i];
          nodes[node.id] = node;

          $("#tag_add_node").append(
            `<li class="mdui-list-item mdui-row">
              <div class="mdui-col-xs-3">${node.name}</div>
              <label class="mdui-list-item mdui-switch">
                <input data-type="add-node" data-node="${node.id}" type="checkbox" />
                <i class="mdui-switch-icon"></i>
              </label>
             </li>`);

          $("#tag_edit_node").append(
            `<li class="mdui-list-item mdui-row">
              <div class="mdui-col-xs-3">${node.name}</div>
              <label class="mdui-list-item mdui-switch">
                <input data-type="edit-node" data-node="${node.id}" type="checkbox" />
                <i class="mdui-switch-icon"></i>
              </label>
            </li>`);
        }

        load_permissions();
        done()
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

function load_permissions() {
  $("#permission_list").empty();

  permissions = [];

  search = $("#search").val();

  $.ajax({
    method: "GET",
    url: "/ajax/admin/permission",
    dataType: "json",
    async: false,
  })
    .done(function (response) {
      if (response.Ok) {
        for (i in response.Data) {
          var permission = response.Data[i];
          permissions[permission.id] = permission;

          if (search != "" && permission.name.indexOf(search) == -1 && String(permission.id).indexOf(search) == -1) continue;

          var html = `<tr>
          <td>${permission.id}</td>
          <td>${permission.name}</td>
          <td>
          <span id="info_${permission.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
            <i class="mdui-icon material-icons">info_outline</i>
          </span>
          <span id="edit_${permission.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '修改'}">
            <i class="mdui-icon material-icons">edit</i>
          </span>
          <span id="delete_${permission.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
            <i class="mdui-icon material-icons">delete</i>
          </span>  
        </td></tr>`;
          $("#permission_list").append(html);

          $(`#info_${permission.id}`).on("click", null, permission, function (event) {
            info_permission(event.data);
          });

          $(`#edit_${permission.id}`).on("click", null, permission.id, function (event) {
            edit_permission(event.data);
          });

          $(`#delete_${permission.id}`).on("click", null, permission.id, function (event) {
            delete_permission(event.data);
          });
        }

        mdui.updateTables("#permission_table");
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

$("#search").keyup(function () {
  $("#permission_list").empty();

  search = $("#search").val();

  for (id in permissions) {
    var permission = permissions[id]

    if (search != "" && permission.name.indexOf(search) == -1 && String(permission.id).indexOf(search) == -1) continue;

    var html = `<tr>
      <td>${permission.id}</td>
      <td>${permission.name}</td>
      <td>
      <span id="info_${permission.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
        <i class="mdui-icon material-icons">info_outline</i>
      </span>
      <span id="edit_${permission.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '修改'}">
        <i class="mdui-icon material-icons">edit</i>
      </span>
      <span id="delete_${permission.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
        <i class="mdui-icon material-icons">delete</i>
      </span>  
    </td></tr>`;
    $("#permission_list").append(html);

    $(`#info_${permission.id}`).on("click", null, permission, function (event) {
      info_permission(event.data);
    });

    $(`#edit_${permission.id}`).on("click", null, permission.id, function (event) {
      edit_permission(event.data);
    });

    $(`#delete_${permission.id}`).on("click", null, permission.id, function (event) {
      delete_permission(event.data);
    });
  }

  mdui.updateTables("#permission_table");
})

load_nodes();