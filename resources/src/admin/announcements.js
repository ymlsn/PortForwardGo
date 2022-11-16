var domparser = new DOMParser();
var announcements = [];

var info = new mdui.Dialog("#tag_Info");
var add = new mdui.Dialog("#tag_Add");
var edit = new mdui.Dialog("#tag_Edit");

$("#add").on("click", function () {
  $("#add_title").val("");
  $("#add_content").val("");

  mdui.mutation()
  mdui.updateTextFields()

  add.open();
});

$("#add_enter").on("click", function () {
  var title = $("#add_title").val();
  var content = $("#add_content").val();

  if (!title || !content) {
    sendmsg("请填完全部内容");
    return;
  }

  $.ajax({
    method: "POST",
    url: "/ajax/admin/announcement",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      title: title,
      content: content,
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg(response.Msg);
        add.close();
        load_announcements();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#add_cancel").on("click", function () {
  add.close();
});

function info_announcement(announcement) {
  $("#info_id").html(announcement.id)
  $("#info_title").html(announcement.title)
  $("#info_content").html(marked.parse(announcement.content));
  $("#info_edit_at").html(announcement.edit_at);

  info.open();
}

$("#info_close").on('click', function () {
  info.close();
})

function edit_announcement(id) {
  $.ajax({
    method: "GET",
    url: "/ajax/admin/announcement?id=" + id,
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        announcement = response.Data;
        announcements[announcement.id] = announcement;

        $("#edit_id").html(announcement.id);
        $("#edit_title").val(announcement.title);
        $("#edit_content").val(announcement.content);

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

  var title = $("#edit_title").val();
  var content = $("#edit_content").val();

  if (!id) {
    return;
  }

  if (!title || !content) {
    sendmsg("请填完全部内容");
    return;
  }

  $.ajax({
    method: "PUT",
    url: "/ajax/admin/announcement?id=" + id,
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      title: title,
      content: content,
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg(response.Msg);
        edit.close();
        load_announcements();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#edit_cancel").on("click", function () {
  edit.close();
});

function delete_announcement(id) {
  mdui.confirm("删除后无法被恢复", "确认删除", function () {
    $.ajax({
      method: "DELETE",
      url: "/ajax/admin/announcement?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg("删除成功");
          load_announcements();
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function load_announcements() {
  announcements = [];
  $("#announcement_list").empty();
  search = $("#search").val();

  $.ajax({
    method: "GET",
    url: "/ajax/admin/announcement",
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        for (i in response.Data) {
          var announcement = response.Data[i];
          announcements[announcement.id] = announcement;

          if (search != "" && announcement.title.indexOf(search) == -1 && String(announcement.id).indexOf(search) == -1) continue;

          var html = `<tr>
            <td>${announcement.id}</td>
            <td>${announcement.title}</td>
            <td>
            <span id="info_${announcement.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
              <i class="mdui-icon material-icons">info_outline</i>
            </span>
            <span id="edit_${announcement.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '编辑'}">
              <i class="mdui-icon material-icons">edit</i>
            </span>
            <span id="delete_${announcement.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
              <i class="mdui-icon material-icons">delete</i>
            </span>
          </td></tr>`;
          $("#announcement_list").prepend(html);

          $(`#info_${announcement.id}`).on("click", null, announcement, function (event) {
            info_announcement(event.data);
          });

          $(`#edit_${announcement.id}`).on("click", null, announcement.id, function (event) {
            edit_announcement(event.data);
          });

          $(`#delete_${announcement.id}`).on("click", null, announcement.id, function (event) {
            delete_announcement(event.data);
          });
        }
        mdui.updateTables("#announcement_table");
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

$("#search").keyup(function () {
  $("#announcement_list").empty();
  search = $("#search").val();

  for (id in announcements) {
    var announcement = announcements[id]

    if (search != "" && announcement.title.indexOf(search) == -1 && String(announcement.id).indexOf(search) == -1) continue;

    var html = `<tr>
    <td>${announcement.id}</td>
    <td>${announcement.title}</td>
    <td>
    <span id="info_${announcement.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '详细'}">
      <i class="mdui-icon material-icons">info_outline</i>
    </span>
    <span id="edit_${announcement.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '编辑'}">
      <i class="mdui-icon material-icons">edit</i>
    </span>
    <span id="delete_${announcement.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
      <i class="mdui-icon material-icons">delete</i>
    </span>
  </td></tr>`;
    $("#announcement_list").append(html);

    $(`#info_${announcement.id}`).on("click", null, announcement, function (event) {
      info_announcement(event.data);
    });

    $(`#edit_${announcement.id}`).on("click", null, announcement.id, function (event) {
      edit_announcement(event.data);
    });

    $(`#delete_${announcement.id}`).on("click", null, announcement.id, function (event) {
      delete_announcement(event.data);
    });
  }

  mdui.updateTables("#announcement_table");
})

load_announcements();
done();