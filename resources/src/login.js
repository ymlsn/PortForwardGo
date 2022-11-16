$("#login").on("click", function () {
  var name = $("#name").val();
  var password = $("#password").val();
  if (!name || !password) {
    sendmsg("用户名/密码不能为空");
    return;
  }
  $.ajax({
    method: "POST",
    url: "/ajax/login",
    data: {
      username: name,
      password: password,
    },
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg("登录成功");
        setTimeout(function () {
          window.location.replace("/");
        }, 3000);
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("登录失败, 请检查网络是否正常");
    });
});

document.onkeyup = function (e) {
  var event = e || window.event;
  var key = event.which || event.keyCode || event.charCode;
  if (key == 13) {
    $("#login").click();
  }
};
