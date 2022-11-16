adminBanner();

var Status = {
    Paid: '<strong class="mdui-text-color-green">已支付</strong>',
    Unpaid: '<strong class="mdui-text-color-red">未支付</strong>',
}

users = [];

function load_users() {
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
                }
            } else sendmsg(response.Msg);
        })
        .fail(function () {
            sendmsg("未能获取服务器数据, 请检查网络是否正常");
        });
}

function load_invoices() {
    $("#invoices-table-body").empty();

    $.ajax({
        method: "GET",
        url: "/ajax/admin/invoices",
        contentType: "application/json",
        dataType: "json",
        async: false,
    })
        .done(function (response) {
            if (response.Ok) {
                for (i in response.Data) {
                    var invoice = response.Data[i];

                    if (users[invoice.user_id] == null) {
                        load_users();
                    }

                    if (users[invoice.user_id] == null) {
                        users[invoice.user_id] = { name: "未知用户" }
                    }

                    var html = `<tr>
                <td>${invoice.id}</td>
                <td>${users[invoice.user_id].name}<br><small class="mdui-text-color-grey">#${invoice.user_id}</small></td>
                <td>￥${invoice.amount}</td>
                <td>${Status[invoice.status]}</td>`;

                    if (invoice.status == "Unpaid") {
                        html += `<td><button id="pay_${invoice.id}" class="mdui-btn mdui-color-theme-accent mdui-ripple" herf="/invoice/${invoice.id}">补单</button></td>`
                    } else {
                        html += "<td></td>"
                    }

                    html += "</tr>"

                    $("#invoices-table-body").prepend(html);

                    $(`#pay_${invoice.id}`).on("click", null, invoice.id, function (event) {
                        pay_invoice(event.data);
                    });
                }
            } else sendmsg(response.Msg);
        })
        .fail(function () {
            sendmsg("未能获取服务器数据, 请检查网络是否正常");
        });
}

function pay_invoice(id) {
    mdui.confirm("补单后无法被恢复", "确认补单", function () {
        $.ajax({
            method: "POST",
            url: "/ajax/admin/invoices",
            dataType: "json",
            data: { id: id },
        })
            .done(function (response) {
                if (response.Ok) {
                    sendmsg("操作成功")
                    load_invoices();
                } else sendmsg(response.Msg);
            })
            .fail(function () {
                sendmsg("未能获取服务器数据, 请检查网络是否正常");
            });
    });
}


load_users();
load_invoices();
done();