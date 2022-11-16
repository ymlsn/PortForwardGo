adminBanner();

var Status = {
    Paid: '<strong class="mdui-text-color-green">已支付</strong>',
    Unpaid: '<strong class="mdui-text-color-red">未支付</strong>',
}

$.ajax({
    method: "GET",
    url: "/ajax/invoices",
    contentType: "application/json",
    dataType: "json",
})
    .done(function (response) {
        if (response.Ok) {
            for (i in response.Data) {
                var invoice = response.Data[i];

                var html = `<tr>
                <td>${invoice.id}</td>
                <td>￥${invoice.amount}</td>
                <td>${Status[invoice.status]}</td>`;

                if (invoice.status == "Unpaid") {
                    html += `<td><a class="mdui-btn mdui-color-theme-accent mdui-ripple" href="/invoice/${invoice.id}">去支付</a></td>`
                } else {
                    html += "<td></td>"
                }

                html += "</tr>"

                $("#invoices-table-body").prepend(html);
            }
            done();
        } else sendmsg(response.Msg);
    })
    .fail(function () {
        sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
