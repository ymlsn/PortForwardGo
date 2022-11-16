var addBalance = new mdui.Dialog("#AddBalance");

$.ajax({
    method: "GET",
    url: "/ajax/userInfo",
    dataType: "json",
})
    .done(function (response) {
        if (response.Ok) {
            if (response.Data.permission == 2) {
                $("#admin_banner").removeAttr("style");
            }

            $("#user_id").html("#" + response.Data.id);
            $("#username").html(response.Data.username);

            if (response.Data.name == "") {
                $("#name").html(response.Data.username);
            } else {
                $("#name").html(response.Data.name);
            }

            $("#balance").html(response.Data.balance);
            switch (response.Data.permission) {
                case 0:
                    $("#permission").html('<font class="mdui-text-color-red">已封禁</font>');
                    break;
                case 1:
                    $("#permission").html('<font class="mdui-text-color-light-blue">普通用户</font>');
                    break;
                case 2:
                    $("#permission").html('<font class="mdui-text-color-orange">管理员</font>');
                    break;
            }

            if (response.Data.token == null) {
                $("#token").html("未设置");
            } else {
                $("#token").html(response.Data.token);
            }

            $("#registration_date").html(response.Data.registration_date);

            done();
        } else sendmsg(response.Msg);
    })
    .fail(function () {
        sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });

$("#change_name").on('click', function () {
    Name = $("#name").html();
    $("#name").html(`<div class="mdui-list-item mdui-textfield"><input id="edit_name" class="mdui-textfield-input" style="width: 350px" /></div>`);
    $("#edit_name").val(Name);
    $("#edit_name").attr('origin_name', Name);

    $("#change_name").attr("style", "display: none;");
    $("#submit_name").removeAttr("style");
    $("#cancel_name").removeAttr("style");
});

$("#submit_name").on('click', function () {
    var Name = $("#edit_name").val();

    if (!Name) {
        sendmsg("新昵称不能为空");
        return;
    }

    $.ajax({
        method: "PUT",
        url: "/ajax/changeName",
        dataType: "json",
        data: {
            "name": Name,
        },
    })
        .done(function (response) {
            if (response.Ok) {
                sendmsg("修改成功");

                $("#name").html(Name);
                $("#change_name").removeAttr("style");
                $("#submit_name").attr("style", "display: none;");
                $("#cancel_name").attr("style", "display: none;");
            } else sendmsg(response.Msg);
        })
        .fail(function () {
            sendmsg("请求失败, 请检查网络是否正常");
        });
})

$("#change_token").on('click', function () {
    mdui.confirm("确认要重置Token吗?", "询问", function () {
        $.ajax({
            method: "PUT",
            url: "/ajax/changeToken",
            dataType: "json",
        })
            .done(function (response) {
                if (response.Ok) {
                    sendmsg("重置成功");
                    $("#token").html(response.Token);
                } else sendmsg(response.Msg);
            })
            .fail(function () {
                sendmsg("请求失败, 请检查网络是否正常");
            });
    });
});

$("#cancel_name").on('click', function () {
    Name = $("#edit_name").attr('origin_name');
    $("#name").html(Name);
    $("#change_name").removeAttr("style");
    $("#submit_name").attr("style", "display: none;");
    $("#cancel_name").attr("style", "display: none;");
})

var changePassword = new mdui.Dialog("#changePassword");

$("#change_password").on('click', function () {
    $("#old_password").val('');
    $("#new_password").val('');
    $("#confirm_password").val('');
    changePassword.open();
});

$("#changepw_enter").on('click', function () {
    var old_pw = $("#old_password").val();
    var new_pw = $("#new_password").val();
    var confirm_pw = $("#confirm_password").val();

    if (!old_pw || !new_pw || !confirm_pw) {
        sendmsg("请填完所有选项");
        return;
    }

    if (new_pw != confirm_pw) {
        sendmsg("新密码与确认密码不符, 请重新输入");
        return;
    }

    $.ajax({
        method: "PUT",
        url: "/ajax/changePassword",
        dataType: "json",
        data: {
            "old": old_pw,
            "new": new_pw,
        },
    })
        .done(function (response) {
            if (response.Ok) {
                sendmsg("修改成功");
                location.reload();
            } else sendmsg(response.Msg);
        })
        .fail(function () {
            sendmsg("请求失败, 请检查网络是否正常");
        });
});

$("#changepw_cancel").on('click', function () {
    changePassword.close();
});


$("#add_balance").on('click', function () {
    $("#add_balance_sum").val('');
    addBalance.open();
});

$("#addbalance_enter").on('click', function () {
    var balance = $("#add_balance_sum").val();

    if (!balance) {
        sendmsg("请填完所有选项");
        return;
    }

    $.ajax({
        method: "POST",
        url: "/ajax/pay",
        dataType: "json",
        data: {
            "money": balance,
        },
    })
        .done(function (response) {
            if (response.Ok) {
                window.location.replace("/invoice/" + response.invoice_id);
            } else sendmsg(response.Msg);
        })
        .fail(function () {
            sendmsg("请求失败, 请检查网络是否正常");
        });
});

$("#addbalance_cancel").on('click', function () {
    addBalance.close();
});