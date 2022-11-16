var domparser = new DOMParser();
var plans = [];
var permissions = [];

var info = new mdui.Dialog("#tag_Info");
var add = new mdui.Dialog("#tag_Add");
var edit = new mdui.Dialog("#tag_Edit");

$("#add").on("click", function () {
  $("#add_name").val("");

  $("#add_permissions option:selected").removeAttr("selected");
  $("#add_hidden").prop("checked", false);

  $("#add_rule").val("");
  $("#add_nat_rule").val("");
  $("#add_traffic").val("");
  $("#add_speed").val("");
  $("#add_conn").val("");

  $("#add_price").val("");
  $("#add_cycle").val("");

  $("#add_note").val("");

  mdui.mutation()
  mdui.updateTextFields()

  add.open();
});

$("#add_enter").on("click", function () {
  var name = $("#add_name").val();
  var permission_id = Number($("#add_permissions option:selected").val());
  var hidden = $("#add_hidden").prop("checked");

  var rule = Number($("#add_rule").val());
  var nat_rule = Number($("#add_nat_rule").val());
  var traffic = Number(($("#add_traffic").val() * 1073741824).toFixed());
  var speed = Number($("#add_speed").val());
  var conn = Number($("#add_conn").val());

  var price = Number($("#add_price").val());
  var cycle = Number($("#add_cycle").val());

  var note = $("#add_note").val();

  if (!permission_id) {
    sendmsg("权限组不能为空");
    return;
  }

  $.ajax({
    method: "POST",
    url: "/ajax/admin/plan",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,
      permission_id: permission_id,
      hidden: hidden,

      rule: rule,
      nat_rule: nat_rule,
      traffic: traffic,
      speed: speed,
      conn: conn,

      price: price,
      cycle: cycle,

      note: note
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg(response.Msg);
        add.close();
        load_plans();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#add_cancel").on("click", function () {
  add.close();
});

function info_plan(plan) {
  $("#info_id").html(plan.id)
  $("#info_name").html(plan.name);
  $("#info_permissions").html(plan.permission_id + " | " + permissions[plan.permission_id].name);
  $("#info_hidden").prop("checked", plan.hidden);


  $("#info_rule").html(plan.rule + " 条");
  $("#info_nat_rule").html(plan.nat_rule + " 条");
  $("#info_traffic").html((plan.traffic / 1073741824).toFixed() + " GB");

  if (plan.speed == 0) $("#info_speed").html("不限制"); else $("#info_speed").html(plan.speed + " Mbps");
  if (plan.maxconn == 0) $("#info_conn").html("不限制"); else $("#info_conn").html(plan.conn);

  if (plan.price == 0) $("#info_price").html("免费"); else $("#info_price").html(plan.price + " 元");
  if (plan.cycle == 0) $("#info_cycle").html("一次性"); else $("#info_cycle").html(plan.cycle + " 天");

  $("#info_note").val(plan.note);
  info.open();
}

$("#info_close").on('click', function () {
  info.close();
})

function edit_plan(id) {
  $.ajax({
    method: "GET",
    url: "/ajax/admin/plan?id=" + id,
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        plan = response.Data;
        plans[plan.id] = plan;

        $("#edit_id").html(plan.id);
        $("#edit_name").val(plan.name);

        $("#edit_permissions option:selected").removeAttr("selected");
        $("#edit_permissions")
          .find("option[value=" + plan.permission_id + "]")
          .prop("selected", true);

        $("#edit_hidden").prop("checked", plan.hidden);

        $("#edit_rule").val(plan.rule);
        $("#edit_nat_rule").val(plan.nat_rule);
        $("#edit_traffic").val(plan.traffic / 1073741824);
        $("#edit_speed").val(plan.speed);
        $("#edit_conn").val(plan.conn);

        $("#edit_price").val(plan.price);
        $("#edit_cycle").val(plan.cycle);

        $("#edit_note").val(plan.note);


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
  var permission_id = Number($("#edit_permissions option:selected").val());
  var hidden = $("#edit_hidden").prop("checked");

  var rule = Number($("#edit_rule").val());
  var nat_rule = Number($("#edit_nat_rule").val());
  var traffic = Number(($("#edit_traffic").val() * 1073741824).toFixed());
  var speed = Number($("#edit_speed").val());
  var conn = Number($("#edit_conn").val());

  var price = Number($("#edit_price").val());
  var cycle = Number($("#edit_cycle").val());

  var note = $("#edit_note").val();

  if (!id) {
    return;
  }

  if (!permission_id) {
    sendmsg("权限组不能为空");
    return;
  }

  $.ajax({
    method: "PUT",
    url: "/ajax/admin/plan?id=" + id,
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,
      permission_id: permission_id,
      hidden: hidden,

      rule: rule,
      nat_rule: nat_rule,
      traffic: traffic,
      speed: speed,
      conn: conn,

      price: price,
      cycle: cycle,

      note: note
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg(response.Msg);
        edit.close();
        load_plans();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#edit_cancel").on("click", function () {
  edit.close();
});

function sync_plan(id) {
  mdui.confirm("同步后无法被恢复", "确认同步", function () {
    $.ajax({
      method: "GET",
      url: "/ajax/admin/plan/sync?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg("同步成功");
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function delete_plan(id) {
  mdui.confirm("删除后无法被恢复", "确认删除", function () {
    $.ajax({
      method: "DELETE",
      url: "/ajax/admin/plan?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg("删除成功");
          load_plans();
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function load_plans() {
  plans = [];
  $("#plan_list").empty();
  search = $("#search").val();

  $.ajax({
    method: "GET",
    url: "/ajax/admin/plan",
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        for (i in response.Data) {
          var plan = response.Data[i];
          plans[plan.id] = plan;

          if (search != "" && plan.name.indexOf(search) == -1 && String(plan.id).indexOf(search) == -1) continue;

          var html = `<tr>
            <td>${plan.id}</td>
            <td>${plan.name}</td>
            <td>${plan.permission_id} | ${permissions[plan.permission_id].name}</td>
            <td>${(plan.traffic / 1073741824).toFixed()} GB</td>`;
          if (plan.speed == 0) {
            html += `<td>无限制</td>`
          } else {
            html += `<td>${plan.speed} Mbps</td>`
          }

          html += `<td>
            <span id="info_${plan.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
              <i class="mdui-icon material-icons">info_outline</i>
            </span>
            <span id="sync_${plan.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '同步'}">
              <i class="mdui-icon material-icons">sync</i>
            </span>
            <span id="edit_${plan.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '修改'}">
              <i class="mdui-icon material-icons">edit</i>
            </span>
            <span id="delete_${plan.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
              <i class="mdui-icon material-icons">delete</i>
            </span>  
          </td></tr>`;
          $("#plan_list").append(html);

          $(`#info_${plan.id}`).on("click", null, plan, function (event) {
            info_plan(event.data);
          });

          $(`#sync_${plan.id}`).on("click", null, plan.id, function (event) {
            sync_plan(event.data);
          });

          $(`#edit_${plan.id}`).on("click", null, plan.id, function (event) {
            edit_plan(event.data);
          });

          $(`#delete_${plan.id}`).on("click", null, plan.id, function (event) {
            delete_plan(event.data);
          });
        }
        mdui.updateTables("#plan_table");
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

function load_permissions() {
  permissions = [];

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

          $("#add_permissions").append(`<option value="${permission.id}">${permission.name}</option>`)
          $("#edit_permissions").append(`<option value="${permission.id}">${permission.name}</option>`)
        }

        load_plans();
        done();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

$("#search").keyup(function () {
  $("#plan_list").empty();
  search = $("#search").val();

  for (id in plans) {
    var plan = plans[id]

    if (search != "" && plan.name.indexOf(search) == -1 && String(plan.id).indexOf(search) == -1) continue;

    var html = `<tr>
      <td>${plan.id}</td>
      <td>${plan.name}</td>
      <td>${plan.permission_id} | ${permissions[plan.permission_id].name}</td>
      <td>${(plan.traffic / 1073741824).toFixed()} GB</td>`;

    if (plan.speed == 0) {
      html += `<td>无限制</td>`
    } else {
      html += `<td>${plan.speed} Mbps</td>`
    }

    html += `<td>
      <span id="info_${plan.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
        <i class="mdui-icon material-icons">info_outline</i>
      </span>
      <span id="sync_${plan.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '同步'}">
        <i class="mdui-icon material-icons">sync</i>
      </span>
      <span id="edit_${plan.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '修改'}">
        <i class="mdui-icon material-icons">edit</i>
      </span>
      <span id="delete_${plan.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
        <i class="mdui-icon material-icons">delete</i>
      </span>  
    </td></tr>`;
    $("#plan_list").append(html);

    $(`#info_${plan.id}`).on("click", null, plan, function (event) {
      info_plan(event.data);
    });

    $(`#sync_${plan.id}`).on("click", null, plan.id, function (event) {
      sync_plan(event.data);
    });

    $(`#edit_${plan.id}`).on("click", null, plan.id, function (event) {
      edit_plan(event.data);
    });

    $(`#delete_${plan.id}`).on("click", null, plan.id, function (event) {
      delete_plan(event.data);
    });
  }

  mdui.updateTables("#plan_table");
})

load_permissions();