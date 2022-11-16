var announcements = [];

adminBanner();
$.ajax({
    method: "GET",
    url: "/ajax/announcement",
    dataType: "json",
    async: false,
})
    .done(function (response) {
        if (response.Ok) {
            if (response.Data == null) {
                $("#no_announcement").removeAttr("style");
                done();
                return;
            }

            var latest_announcement = null
            for (i in response.Data) {
                var announcement = response.Data[i]

                announcements[announcement.id] = announcement
                if (latest_announcement == null || compareTime(announcement.edit_at, latest_announcement.edit_at)) {
                    latest_announcement = announcement
                }

                $("#announcement-select").prepend(`<option value="${announcement.id}">${announcement.title}</option>`);
            }

            $("#title").html(latest_announcement.title)
            $("#edit_at").html(latest_announcement.edit_at)
            $("#content").html(marked.parse(latest_announcement.content));
            $("#announcement-select")
                .find("option[value=" + latest_announcement.id + "]")
                .prop("selected", true);

            $("#view_announcement").removeAttr("style");
            done();
        } else sendmsg(response.Msg);
    })
    .fail(function () {
        sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });

$("#announcement-select").on('change', function () {
    var id = $("#announcement-select option:selected").val();
    if (!id || announcements[id] == null) {
        return;
    }

    var announcement = announcements[id]
    $("#title").html(announcement.title)
    $("#edit_at").html(announcement.edit_at)
    $("#content").html(marked.parse(announcement.content));
})

$("#share").on('click', function () {
    var id = $("#announcement-select option:selected").val();
    if (!id || announcements[id] == null) {
        sendmsg("复制失败");
        return;
    }

    var clipboard = new ClipboardJS('#share', {
        text: function () {
            return window.location.origin + "/announcement/" + id;
        }
    })

    clipboard.on('success', function (e) {
        sendmsg("链接已复制");
    })

    clipboard.on('error', function (e) {
        sendmsg("复制失败");
    })
})