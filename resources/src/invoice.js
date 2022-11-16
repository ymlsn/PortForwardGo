adminBanner();

var invoice_id = 0;

var paymethods = {
    qqpay: "",
    wxpay: "微信支付",
    alipay: "支付宝",
}

$.ajax({
    method: "GET",
    url: window.location.href,
    contentType: "application/json",
    dataType: "json",
})
    .done(function (response) {
        if (response.Ok) {
            var invoice = response.invoice
            invoice_id = invoice.id;
            $("#invoice_id").append(invoice.id)
            $("#amount").append(invoice.amount)
            if (invoice.status == "Paid") {
                $("#pay").attr("style", "display: none;");
                $("#status_paid").removeAttr("hidden");
            } else $("#status_unpaid").removeAttr("hidden")

            for (payment in response.payments) {
                switch (payment) {
                    case "epay":
                        var methods = response.payments[payment].methods.split("|")
                        for (i in methods) {
                            var method = methods[i]
                            $("#payment").append(`<option value="${payment}" method="${method}">${response.payments[payment].name} (${paymethods[method]})</option>`);
                        }
                        break;
                    default:
                        $("#payment").append(`<option value="${payment}">${response.payments[payment].name}</option>`);
                        break;
                }
            }

            done();
        } else {
            sendmsg(response.Msg);
        }
    })
    .fail(function () {
        sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });

$("#payment").on('change', function () {
    var extra = '';
    var payment = $("#payment option:selected").val();

    $("#qrcode").empty();
    $("#pay_redirect").removeAttr("href");

    $("#pay_info").attr("style", "display: none;");
    $("#qrcode").attr("style", "display: none;");
    $("#redirect").attr("style", "display: none;");

    if (!payment) {
        return;
    }

    switch (payment) {
        case "epay":
            extra += "&method=" + $("#payment option:selected").attr("method")
            break;
        default:
    }

    if (!invoice_id) {
        sendmsg("内部错误");
        return;
    }

    $("#progress").removeAttr("style");
    $("#pay_info").removeAttr("style");

    $.ajax({
        method: "GET",
        url: "/ajax/pay/" + payment + "?id=" + invoice_id + extra,
        contentType: "application/json",
        dataType: "json",
    })
        .done(function (response) {
            $("#progress").attr("style", "display: none;");

            if (response.Ok) {
                if (response.QrCode != null) {
                    $("#qrcode").qrcode({ width: "200", height: "200", foreground: "#000000", text: response.QrCode });
                    $("#qrcode").removeAttr("style");
                }

                if (response.RedirectLink != null) {
                    $("#pay_redirect").attr("href", response.RedirectLink);
                    $("#redirect").removeAttr("style");
                }
            } else {
                sendmsg(response.Msg);
            }
        })
        .fail(function () {
            $("#progress").attr("style", "display: none;");
            sendmsg("未能获取服务器数据, 请检查网络是否正常");
        });

})