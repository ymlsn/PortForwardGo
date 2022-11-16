function register() {
  var name = $("#name").val();
  var password = $("#password").val();
  var recaptcha = $("#g-recaptcha-response").val()
  if (!name || !password) {
    sendmsg("用户名/密码不能为空");
    return;
  }

  if (recaptcha == null) {
    recaptcha = "";
  }


  $.ajax({
    method: "POST",
    url: "/ajax/register",
    data: {
      username: name,
      password: password,
      recaptcha: recaptcha,
    },
    dataType: "json",
  })
    .done(function (response) {
      if (response.Ok) {
        sendmsg("注册成功");
        setTimeout(function () {
          window.location.replace("/");
        }, 3000);
      } else sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("登录失败, 请检查网络是否正常");
    });
}

document.onkeyup = function (e) {
  var event = e || window.event;
  var key = event.which || event.keyCode || event.charCode;
  if (key == 13) {
    if ($("#register").attr("disabled") != null) {
      return;
    }
    $("#register").click();
  }
};

$.ajax({
  method: "GET",
  url: "/ajax/register",
  dataType: "json",
  async: false,
})
  .done(function (response) {
    if (response.Ok) {
      if (!response.register) {
        return;
      }

      $("#name").removeAttr("disabled");
      $("#password").removeAttr("disabled");
      $("#register").removeAttr("disabled");

      if (response.reCAPTCHA) {
        siteKey = response.siteKey;

        jQuery.getScript("https://www.recaptcha.net/recaptcha/api.js?onload=loadCaptcha&render=explicit");
      } else {
        $("#register").on("click", register);
      }

      mdui.mutation()
      mdui.updateTextFields()
    } else sendmsg(response.Msg);
  })
  .fail(function () {
    sendmsg("未能获取服务器数据, 请检查网络是否正常");
  });

function loadCaptcha() {
  var recaptcha = grecaptcha.render('recaptcha', {
    sitekey: siteKey,
    size: "invisible",
    callback: register,
  })

  $("#register").on("click", function () {
    grecaptcha.reset(recaptcha)
    grecaptcha.execute(recaptcha)
  });
}