adminBanner();

$.ajax({
    method: "GET",
    url: "/ajax/cart",
    dataType: "json",
})
    .done(function (response) {
        if (response.Ok) {
            for (i in response.Plan) {
                var plan = response.Plan[i]
                var html = `<tr>
                <td>${plan.name}</td>
                <td>${plan.rule}</td>
                <td>${plan.nat_rule}</td>`;

                if (plan.speed == 0) {
                    html += `<td>无限制</td>`;
                } else {
                    html += `<td>${plan.speed} Mbps</td>`;
                }

                if (plan.conn == 0) {
                    html += `<td>无限制</td>`;
                } else {
                    html += `<td>${plan.conn}</td>`;
                }

                html += `<td>${(plan.traffic / 1073741824).toFixed()} GB</td>`;

                if (plan.cycle == 0) {
                    html += `<td>一次性</td>`;
                } else {
                    html += `<td>${plan.cycle} 天</td>`;
                }

                if (plan.price == 0) {
                    html += `<td>免费</td>`;
                } else {
                    html += `<td>￥${plan.price}</td>`;
                }

                html += `<td>
                <span id="buy_${plan.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '购买'}">
                    <i class="mdui-icon material-icons">shopping_cart</i>
                </span>
                </td>`;
                html += `</tr>`;
                $("#cart-table-body").append(html);

                $(`#buy_${plan.id}`).on("click", null, plan.id, function (event) {
                    buy(event.data);
                });
            }

            done();
        } else sendmsg(response.Msg);
    })
    .fail(function () {
        sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });

function buy(id) {
    mdui.confirm("确认购买此套餐? 请确保账户内余额充足", "确认购买", function () {
        $.ajax({
            method: "POST",
            url: "/ajax/buy",
            dataType: "json",
            data: {
                id: id,
            }
        })
            .done(function (response) {
                sendmsg(response.Msg);
            })
            .fail(function () {
                sendmsg("请求失败, 请检查网络是否正常");
            });
    })
}