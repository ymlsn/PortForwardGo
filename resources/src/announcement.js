$.ajax({
    method: "GET",
    url: window.location.href,
    contentType: "application/json",
    dataType: "json",
})
    .done(function (response) {
        if (response.Ok) {
            var announcement = response.Data

            $("#title").html(announcement.title)
            $("#edit_at").html(announcement.edit_at)
            $("#content").html(marked.parse(announcement.content));

            $("#view_announcement").removeAttr("style");
            done();
        } else {
            $("#error").removeAttr("style");
            $("#error").html(response.Msg);
            done();
            sendmsg(response.Msg);
        }
    })
    .fail(function () {
        sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
