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

            $("#welcome").append(" " + response.Data.name);

            if (response.Data.permission_id == 0) {
                $("#no_plan").removeAttr("style");
                done();
                return;
            }

            done();
        } else sendmsg(response.Msg);
    })
    .fail(function () {
        sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });

