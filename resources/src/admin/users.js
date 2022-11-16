var domparser = new DOMParser();
var plans = [];
var permissions = [];
var users = [];


var info = new mdui.Dialog("#tag_Info");
var add = new mdui.Dialog("#tag_Add");
var edit = new mdui.Dialog("#tag_Edit");

$("#add").on("click", function () {
  $("#add_name").val("");
  $("#add_username").val("");
  $("#add_password").val("");

  $("#add_plan option:selected").removeAttr("selected");
  $("#add_permissions option:selected").removeAttr("selected");
  $("#add_resetdate").val("");
  $("#add_expiredate").val("");
  $("#add_autorenew").prop("checked", false);

  $("#add_rule").val("");
  $("#add_nat_rule").val("");
  $("#add_traffic").val("");
  $("#add_traffic_used").val("");
  $("#add_speed").val("");
  $("#add_maxconn").val("");

  $("#add_balance").val("");
  $("#add_price").val("");
  $("#add_cycle").val("");
  $("#add_permission option:selected").removeAttr("selected");

  $("#add_permission")
    .find("option[value=1]")
    .prop("selected", true);

  mdui.mutation()
  mdui.updateTextFields()

  add.open();
});

$("#add_plan").on("change", function () {
  var plan_id = Number($("#add_plan option:selected").val());
  if (!plan_id) {
    return;
  }

  var plan = plans[plan_id];
  $("#add_permissions option:selected").removeAttr("selected");
  $("#add_permissions")
    .find("option[value=" + plan.permission_id + "]")
    .prop("selected", true);

  if (plan.cycle > 0) {
    var date = new Date()
    date.setDate(date.getDate() + plan.cycle)

    $("#add_resetdate").val(formatDate(date));
    $("#add_expiredate").val(formatDate(date));
  }

  $("#add_rule").val(plan.rule);
  $("#add_nat_rule").val(plan.nat_rule);
  $("#add_traffic").val((plan.traffic / 1073741824).toFixed());
  $("#add_speed").val(plan.speed);
  $("#add_maxconn").val(plan.conn);

  $("#add_price").val(plan.price);
  $("#add_cycle").val(plan.cycle);
})

$("#add_enter").on("click", function () {
  var name = $("#add_name").val();
  var username = $("#add_username").val();
  var password = $("#add_password").val();

  var plan_id = Number($("#add_plan option:selected").val());
  var permission_id = Number($("#add_permissions option:selected").val());
  var reset_date = $("#add_resetdate").val();
  var expire_date = $("#add_expiredate").val();
  var auto_renew = $("#add_autorenew").prop("checked");

  var rule = Number($("#add_rule").val());
  var nat_rule = Number($("#add_nat_rule").val());
  var traffic = Number(($("#add_traffic").val() * 1073741824).toFixed());
  var traffic_used = Number(($("#add_traffic_used").val() * 1073741824).toFixed());
  var speed = Number($("#add_speed").val());
  var maxconn = Number($("#add_maxconn").val());

  var balance = Number($("#add_balance").val());
  var price = Number($("#add_price").val());
  var cycle = Number($("#add_cycle").val());
  var permission = Number($("#add_permission option:selected").val());

  if (!username) {
    sendmsg("用户名不能为空");
    return;
  }

  if (!password) {
    sendmsg("密码不能为空");
    return;
  }

  $.ajax({
    method: "POST",
    url: "/ajax/admin/user",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,
      username: username,
      password: password,

      plan_id: plan_id,
      permission_id: permission_id,
      reset_date: reset_date,
      expire_date: expire_date,
      auto_renew: auto_renew,

      rule: rule,
      nat_rule: nat_rule,
      traffic: traffic,
      traffic_used: traffic_used,
      speed: speed,
      maxconn: maxconn,

      balance: balance,
      price: price,
      cycle: cycle,
      permission: permission
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg("添加成功");
        add.close();
        load_users();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#add_cancel").on("click", function () {
  add.close();
});

function info_user(user) {
  $("#info_id").html(user.id)
  $("#info_name").html(user.name);
  $("#info_username").html(user.username);
  $("#info_token").html(user.token);
  if (user.last_ip == null) $("#info_last_ip").html(""); else $("#info_last_ip").html(user.last_ip);
  if (user.last_active == "0001-01-01") $("#info_last_active").html(""); else $("#info_last_active").html(user.last_active);
  $("#info_registration_date").html(user.registration_date);

  if (user.plan_id == 0) $("#info_plan").html("无"); else $("#info_plan").html(user.plan_id + " | " + plans[user.plan_id].name);
  if (user.permission_id == 0) $("#info_permissions").html("无"); else $("#info_permissions").html(user.permission_id + " | " + permissions[user.permission_id].name);

  if (user.reset_date == "0001-01-01") $("#info_resetdate").html("无"); else $("#info_resetdate").html(user.reset_date);
  if (user.expire_date == "0001-01-01") $("#info_expiredate").html("无"); else $("#info_expiredate").html(user.expire_date);

  $("#info_autorenew").prop("checked", user.auto_renew);
  $("#info_balance").html(user.balance + " 元");

  if (user.permission_id == 0) {
    $("#info_rule").html("未购买");
    $("#info_nat_rule").html("未购买");
    $("#info_traffic").html("未购买");
    $("#info_traffic_used").html("未购买");

    $("#info_speed").html("未购买");
    $("#info_maxconn").html("未购买");
    $("#info_price").html("未购买");
    $("#info_cycle").html("未购买");
  } else {
    $("#info_rule").html(user.rule + " 条");
    $("#info_nat_rule").html(user.nat_rule + " 条");
    $("#info_traffic").html((user.traffic / 1073741824).toFixed() + " GB");
    $("#info_traffic_used").html((user.traffic_used / 1073741824).toFixed(2) + " GB");

    if (user.speed == 0) $("#info_speed").html("不限制"); else $("#info_speed").html(user.speed + " Mbps");
    if (user.maxconn == 0) $("#info_maxconn").html("不限制"); else $("#info_maxconn").html(user.maxconn);

    if (user.reset_date == "0001-01-01" && user.expire_date == "0001-01-01") {
      $("#info_price").html("一次性终身套餐");
      $("#info_cycle").html("一次性终身套餐");
    } else if (user.reset_date == "0001-01-01") {
      $("#info_price").html("一次性套餐");
      $("#info_cycle").html("一次性套餐");
    } else if (user.expire_date == "0001-01-01") {
      $("#info_price").html("终身套餐");
      $("#info_cycle").html("终身套餐");
    } else {
      $("#info_price").html(user.price + " 元");
      $("#info_cycle").html(user.cycle + " 天");
    }
  }

  switch (user.permission) {
    case 0:
      $("#info_permission").html(`<td><font class="mdui-text-color-red">已禁用</font></td>`)
      break;
    case 1:
      $("#info_permission").html(`<td><font class="mdui-text-color-light-blue">普通用户</font></td>`)
      break;
    case 2:
      $("#info_permission").html(`<td><font class="mdui-text-color-orange">管理员</font></td>`)
      break;
  }

  info.open();
}

$("#info_close").on('click', function () {
  info.close();
})

function edit_user(id) {
  $.ajax({
    method: "GET",
    url: "/ajax/admin/user?id=" + id,
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        user = response.Data;
        users[user.id] = user;

        $("#edit_id").html(user.id)
        $("#edit_name").val(user.name);
        $("#edit_username").val(user.username);
        $("#edit_password").val("");

        $("#edit_plan option:selected").removeAttr("selected");
        $("#edit_permissions option:selected").removeAttr("selected");

        $("#edit_plan")
          .find("option[value=" + user.plan_id + "]")
          .prop("selected", true);
        $("#edit_permissions")
          .find("option[value=" + user.permission_id + "]")
          .prop("selected", true);

        if (user.reset_date == "0001-01-01") {
          $("#edit_resetdate").val("")
        } else {
          $("#edit_resetdate").val(user.reset_date);
        }


        if (user.expire_date == "0001-01-01") {
          $("#edit_expiredate").val("");
        } else {
          $("#edit_expiredate").val(user.expire_date);
        }

        $("#edit_autorenew").prop("checked", user.auto_renew);

        $("#edit_rule").val(user.rule);
        $("#edit_nat_rule").val(user.nat_rule);
        $("#edit_traffic").val((user.traffic / 1073741824).toFixed());
        $("#edit_traffic_used").val((user.traffic_used / 1073741824).toFixed(2));
        $("#edit_speed").val(user.speed);
        $("#edit_maxconn").val(user.maxconn);

        $("#edit_balance").val(user.balance);
        $("#edit_price").val(user.price);
        $("#edit_cycle").val(user.cycle);
        $("#edit_permission option:selected").removeAttr("selected");
        $("#edit_permission")
          .find("option[value=" + user.permission + "]")
          .prop("selected", true);

        mdui.mutation()
        mdui.updateTextFields()

        edit.open();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
}

$("#edit_plan").on("change", function () {
  var plan_id = Number($("#edit_plan option:selected").val());
  if (!plan_id) {
    return;
  }

  var plan = plans[plan_id];
  $("#edit_permissions option:selected").removeAttr("selected");
  $("#edit_permissions")
    .find("option[value=" + plan.permission_id + "]")
    .prop("selected", true);

  $("#edit_rule").val(plan.rule);
  $("#edit_nat_rule").val(plan.nat_rule);
  $("#edit_traffic").val((plan.traffic / 1073741824).toFixed());
  $("#edit_speed").val(plan.speed);
  $("#edit_maxconn").val(plan.conn);

  $("#edit_price").val(plan.price);
  $("#edit_cycle").val(plan.cycle);
})

$("#edit_enter").on("click", function () {
  var id = $("#edit_id").html();

  var name = $("#edit_name").val();
  var password = $("#edit_password").val();

  var plan_id = Number($("#edit_plan option:selected").val());
  var permission_id = Number($("#edit_permissions option:selected").val());
  var reset_date = $("#edit_resetdate").val();
  var expire_date = $("#edit_expiredate").val();
  var auto_renew = $("#edit_autorenew").prop("checked");

  var rule = Number($("#edit_rule").val());
  var nat_rule = Number($("#edit_nat_rule").val());
  var traffic = Number(($("#edit_traffic").val() * 1073741824).toFixed());
  var traffic_used = Number(($("#edit_traffic_used").val() * 1073741824).toFixed());
  var speed = Number($("#edit_speed").val());
  var maxconn = Number($("#edit_maxconn").val());

  var balance = Number($("#edit_balance").val());
  var price = Number($("#edit_price").val());
  var cycle = Number($("#edit_cycle").val());
  var permission = Number($("#edit_permission option:selected").val());

  if (!id) {
    return;
  }

  $.ajax({
    method: "PUT",
    url: "/ajax/admin/user?id=" + id,
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,
      password: password,

      plan_id: plan_id,
      permission_id: permission_id,
      reset_date: reset_date,
      expire_date: expire_date,
      auto_renew: auto_renew,

      rule: rule,
      nat_rule: nat_rule,
      traffic: traffic,
      traffic_used: traffic_used,
      speed: speed,
      maxconn: maxconn,

      balance: balance,
      price: price,
      cycle: cycle,
      permission: permission
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg(response.Msg);
        edit.close();
        load_users();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#edit_cancel").on("click", function () {
  edit.close();
});

function reset_user(id) {
  mdui.confirm("真的要重置流量吗? ", "确认", function () {
    $.ajax({
      method: "POST",
      url: "/ajax/admin/user/resetTraffic",
      dataType: "json",
      data: { id: id },
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg(response.Msg);
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function delete_user(id) {
  mdui.confirm("删除后无法被恢复", "确认删除", function () {
    $.ajax({
      method: "DELETE",
      url: "/ajax/admin/user?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg("删除成功");
          load_users();
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function load_users() {
  users = [];
  $("#user_list").empty();
  search = $("#search").val();

  $.ajax({
    method: "GET",
    url: "/ajax/admin/user",
    dataType: "json",
    async: false,
  })
    .done(function (response) {
      if (response.Ok) {
        for (id in response.Data) {
          var user = response.Data[id];
          users[user.id] = user

          if (search != "" && user.username.indexOf(search) == -1 && String(user.id).indexOf(search) == -1) continue;

          var html = `<tr>
            <td>${user.id}</td>
            <td>${user.name}<br><small class="mdui-text-color-grey">${user.username}</td>`;

          if (user.plan_id == 0) {
            html += `<td>无</td>`
          } else {
            html += `<td>${user.plan_id} | ${plans[user.plan_id].name}</td>`
          }

          if (user.permission_id == 0) {
            html += `<td>无</td>`
          } else {
            html += `<td>${user.permission_id} | ${permissions[user.permission_id].name}</td>`
          }

          if (user.expire_date == "0001-01-01") {
            html += `<td>无</td>`
          } else {
            html += `<td>${user.expire_date}</td>`
          }

          switch (user.permission) {
            case 0:
              html += `<td><font class="mdui-text-color-red">已禁用</font></td>`
              break;
            case 1:
              html += `<td><font class="mdui-text-color-light-blue">普通用户</font></td>`
              break;
            case 2:
              html += `<td><font class="mdui-text-color-orange">管理员</font></td>`
              break;
          }

          html += `<td>
            <span id="info_${user.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
              <i class="mdui-icon material-icons">info_outline</i>
            </span>
            <span id="edit_${user.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '修改'}">
              <i class="mdui-icon material-icons">edit</i>
            </span>
            <span id="reset_${user.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '重置流量'}">
              <i class="mdui-icon material-icons">autorenew</i>
            </span>
            <span id="delete_${user.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
              <i class="mdui-icon material-icons">delete</i>
            </span>  
          </td></tr>`;
          $("#user_list").prepend(html);

          $(`#info_${user.id}`).on("click", null, user, function (event) {
            info_user(event.data);
          });

          $(`#edit_${user.id}`).on("click", null, user.id, function (event) {
            edit_user(event.data);
          });

          $(`#reset_${user.id}`).on("click", null, user.id, function (event) {
            reset_user(event.data);
          });

          $(`#delete_${user.id}`).on("click", null, user.id, function (event) {
            delete_user(event.data);
          });
        }

        mdui.updateTables("#user_table");
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

function load_plans() {
  plans = [];

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


          $("#add_plan").append(`<option value="${plan.id}">${plan.name}</option>`)
          $("#edit_plan").append(`<option value="${plan.id}">${plan.name}</option>`)
        }

        load_permissions();

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

        load_users();
        done();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

$("#search").keyup(function () {
  $("#user_list").empty();
  search = $("#search").val();

  for (id in users) {
    var user = users[id]

    if (search != "" && user.username.indexOf(search) == -1 && String(user.id).indexOf(search) == -1) continue;

    var html = `<tr>
      <td>${user.id}</td>
      <td>${user.name}<br><small class="mdui-text-color-grey">${user.username}</td>`;

    if (user.plan_id == 0) {
      html += `<td>无</td>`
    } else {
      html += `<td>${user.plan_id} | ${plans[user.plan_id].name}</td>`
    }

    if (user.permission_id == 0) {
      html += `<td>无</td>`
    } else {
      html += `<td>${user.permission_id} | ${permissions[user.permission_id].name}</td>`
    }

    if (user.expire_date == "0001-01-01") {
      html += `<td>无</td>`
    } else {
      html += `<td>${user.expire_date}</td>`
    }

    switch (user.permission) {
      case 0:
        html += `<td><font class="mdui-text-color-red">已禁用</font></td>`
        break;
      case 1:
        html += `<td><font class="mdui-text-color-light-blue">普通用户</font></td>`
        break;
      case 2:
        html += `<td><font class="mdui-text-color-orange">管理员</font></td>`
        break;
    }

    html += `<td>
      <span id="info_${user.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
        <i class="mdui-icon material-icons">info_outline</i>
      </span>
      <span id="edit_${user.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '修改'}">
        <i class="mdui-icon material-icons">edit</i>
      </span>
      <span id="reset_${user.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '重置流量'}">
        <i class="mdui-icon material-icons">autorenew</i>
      </span>
      <span id="delete_${user.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
        <i class="mdui-icon material-icons">delete</i>
      </span>  
    </td></tr>`;
    $("#user_list").prepend(html);

    $(`#info_${user.id}`).on("click", null, user, function (event) {
      info_user(event.data);
    });

    $(`#edit_${user.id}`).on("click", null, user.id, function (event) {
      edit_user(event.data);
    });

    $(`#reset_${user.id}`).on("click", null, user.id, function (event) {
      reset_user(event.data);
    });

    $(`#delete_${user.id}`).on("click", null, user.id, function (event) {
      delete_user(event.data);
    });
  }

  mdui.updateTables("#user_table");
})

load_plans();