var domparser = new DOMParser();

var Add = new mdui.Dialog("#addDevice");
var Edit = new mdui.Dialog("#editDevice");

$("#add").on("click", function () {
  $("#add_name").val("");

  mdui.mutation()
  mdui.updateTextFields()

  Add.open();
});

$("#add_enter").on("click", function () {
  var name = $("#add_name").val();
  if (!name) {
    sendmsg("名称不能为空");
    return;
  }

  $.ajax({
    method: "POST",
    url: "/ajax/nat_device",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg("添加成功");
        Add.close();
        load_devices();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#add_cancel").on("click", function () {
  Add.close();
});

function edit_device(id) {
  $.ajax({
    method: "GET",
    url: "/ajax/nat_device?id=" + id,
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        device = response.Data;

        $("#edit_id").html(device.id);
        $("#edit_name").val(device.name);

        mdui.mutation()
        mdui.updateTextFields()

        Edit.open();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
}

$("#edit_enter").on("click", function () {
  var id = $("#edit_id").html();

  if (!id) {
    return;
  }

  var name = $("#edit_name").val();
  if (!name) {
    sendmsg("名称不能为空");
    return;
  }

  $.ajax({
    method: "PUT",
    url: "/ajax/nat_device?id=" + id,
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      name: name,
    }),
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg("修改成功");
        Edit.close();
        load_devices();
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#edit_cancel").on("click", function () {
  Edit.close();
});


function delete_device(id) {
  mdui.confirm("删除后无法被恢复", "确认删除", function () {
    $.ajax({
      method: "DELETE",
      url: "/ajax/nat_device?id=" + id,
      dataType: "json",
    })
      .done(function (response) {
        if (response.Ok) {
          sendmsg("删除成功");
          load_devices();
        } else sendmsg(response.Msg);
      })
      .fail(function () {
        sendmsg("请求失败, 请检查网络是否正常");
      });
  });
}

function load_devices() {
  $("#device_list").empty();

  $.ajax({
    method: "GET",
    url: "/ajax/nat_device",
    dataType: "json",
    async: false,
  })
    .done(function (response) {
      if (response.Ok) {

        for (i in response.Data) {
          var device = response.Data[i];

          if (device.version == "") {
            device.version = ""
            device.updated = ""
          }

          var html = `<tr id="device_${device.id}" data-device="${device.id}">
          <td class="mdui-table-cell-checkbox">
            <label class="mdui-checkbox">
              <input type="checkbox">
              <i class="mdui-checkbox-icon"></i>
            </label>
          </td>
          <td>${device.name}<br><small class="mdui-text-color-grey">#${device.id}</td>
          <td>${device.version}</td>
          <td>${device.secret}</td>
          <td>${device.updated}</td>
          <td>
          <span id="edit_${device.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '编辑'}">
            <i class="mdui-icon material-icons">edit</i>
          </span>
          <span id="delete_${device.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '删除'}">
            <i class="mdui-icon material-icons">delete</i>
          </span>
          <span id="copy_${device.id}" class="mdui-btn mdui-btn-icon" mdui-tooltip="{content: '复制对接命令'}">
            <i class="mdui-icon material-icons">content_copy</i>
          </span>
          </td>
        </tr>`;

          $("#device_list").append(html);

          $(`#edit_${device.id}`).on("click", null, device.id, function (event) {
            edit_device(event.data);
          });

          $(`#delete_${device.id}`).on("click", null, device.id, function (event) {
            delete_device(event.data);
          });

          $(`#copy_${device.id}`).on("click", null, { id: device.id, secret: device.secret }, function (event) {
            copy_script(event.data.id, event.data.secret);
          });
        }

        mdui.updateTables("#device_table");
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("未能获取服务器数据, 请检查网络是否正常");
    });
}

function copy_script(id, secret) {
  var clipboard = new ClipboardJS(`#copy_${id}`, {
    text: function () {
      return `bash <(curl -sSL "https://gitlab.com/CoiaPrant/PortForwardGo/-/raw/master/scripts/install_rclient.sh") --api ${window.location.origin}/sync/nat_device --id ${id} --secret ${secret}`;
    }
  })

  clipboard.on('success', function (e) {
    sendmsg("复制成功");
  })

  clipboard.on('error', function (e) {
    sendmsg("复制失败");
  })
}

$("#delete_checked").on('click', function () {
  var success = 0
  var failed = 0

  mdui.confirm("删除后规则无法被恢复", "确认删除", function () {
    $("tr[data-device]").each(function () {
      var device_id = $(this).attr("data-device");
      var checked = $(this).find("td[class=mdui-table-cell-checkbox]").find("label").find("input[type=checkbox]").prop('checked');

      if (!checked || !device_id) {
        return;
      }

      $.ajax({
        method: "DELETE",
        url: "/ajax/nat_device?id=" + device_id,
        dataType: "json",
        async: false,
      }).done(function (response) {
        if (response.Ok) {
          success += 1
        } else failed += 1;
      })
        .fail(function () {
          failed += 1
        });
    });

    sendmsg(`操作完成, 成功${success}个, 失败${failed}个`);
    load_devices();
  });
})

adminBanner();
load_devices();
done();