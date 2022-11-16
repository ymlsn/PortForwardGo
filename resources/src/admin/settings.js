var domparser = new DOMParser();

$("#base_save").on("click", function () {
  var system_url = $("#system_url").val();
  var license = $("#license").val();
  var secure_key = $("#secure_key").val();
  var certificate = $("#certificate").val();
  var certificate_key = $("#certificate_key").val();

  var register = String($("#register").prop('checked'));
  var register_recaptcha = String($("#register_recaptcha").prop('checked'));
  var recaptcha_public = $("#recaptcha_public").val();
  var recaptcha_private = $("#recaptcha_private").val();

  $.ajax({
    method: "POST",
    url: "/ajax/admin/settings",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      system_url: system_url,
      license: license,
      secure_key: secure_key,
      certificate: certificate,
      certificate_key: certificate_key,

      register: register,
      register_recaptcha: register_recaptcha,
      recaptcha_public: recaptcha_public,
      recaptcha_private: recaptcha_private,
    }),
  })
    .done(function (response) {
      sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#whmcs_save").on("click", function () {
  var enable = String($("[payment=whmcs][name=enable]").prop("checked"));
  var display = $("[payment=whmcs][name=display]").val()
  var fee = String(Number($("[payment=whmcs][name=fee]").val()).toFixed(2))
  var api = $("[payment=whmcs][name=api]").val()
  var secret = $("[payment=whmcs][name=secret]").val()

  if ((enable == "true") && (!display || !api || !secret)) {
    sendmsg("请填写完全部内容或关闭当前支付方式");
    return;
  }

  $.ajax({
    method: "POST",
    url: "/ajax/admin/settings/payments?type=whmcs",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      enable: enable,
      display: display,
      fee: fee,
      api: api,
      secret: secret,
    }),
  })
    .done(function (response) {
      sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#alipay_qr_save").on("click", function () {
  var enable = String($("[payment=alipay_qr][name=enable]").prop("checked"));
  var display = $("[payment=alipay_qr][name=display]").val()
  var fee = String(Number($("[payment=alipay_qr][name=fee]").val()).toFixed(2))
  var appid = $("[payment=alipay_qr][name=appid]").val()
  var public_key = $("[payment=alipay_qr][name=public_key]").val()
  var private_key = $("[payment=alipay_qr][name=private_key]").val()

  if ((enable == "true") && (!display || !appid || !public_key || !private_key)) {
    sendmsg("请填写完全部内容或关闭当前支付方式");
    return;
  }

  $.ajax({
    method: "POST",
    url: "/ajax/admin/settings/payments?type=alipay_qr",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      enable: enable,
      display: display,
      fee: fee,
      appid: appid,
      public_key: public_key,
      private_key: private_key,
    }),
  })
    .done(function (response) {
      sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#epay_save").on("click", function () {
  var enable = String($("[payment=epay][name=enable]").prop("checked"));
  var display = $("[payment=epay][name=display]").val()
  var fee = String(Number($("[payment=epay][name=fee]").val()).toFixed(2))
  var api = $("[payment=epay][name=api]").val()
  var id = $("[payment=epay][name=id]").val()
  var key = $("[payment=epay][name=key]").val()

  if ((enable == "true") && (!display || !api || !id || !key)) {
    sendmsg("请填写完全部内容或关闭当前支付方式");
    return;
  }

  var methods = [];
  $("input[type=checkbox][payment=epay][method]").each(function (_, item) {
    if (item.checked) methods.push($(this).attr("method"))
  });

  $.ajax({
    method: "POST",
    url: "/ajax/admin/settings/payments?type=epay",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      enable: enable,
      display: display,
      fee: fee,
      api: api,
      id: id,
      key: key,
      methods: methods.join("|"),
    }),
  })
    .done(function (response) {
      sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#mgate_save").on("click", function () {
  var enable = String($("[payment=mgate][name=enable]").prop("checked"));
  var display = $("[payment=mgate][name=display]").val()
  var fee = String(Number($("[payment=mgate][name=fee]").val()).toFixed(2))
  var api = $("[payment=mgate][name=api]").val()
  var app_id = $("[payment=mgate][name=app_id]").val()
  var app_secret = $("[payment=mgate][name=app_secret]").val()

  if ((enable == "true") && (!display || !api || !app_id || !app_secret)) {
    sendmsg("请填写完全部内容或关闭当前支付方式");
    return;
  }

  $.ajax({
    method: "POST",
    url: "/ajax/admin/settings/payments?type=mgate",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      enable: enable,
      display: display,
      fee: fee,
      api: api,
      app_id: app_id,
      app_secret: app_secret,
    }),
  })
    .done(function (response) {
      sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});

$("#usdt_trc20_save").on("click", function () {
  var enable = String($("[payment=usdt_trc20][name=enable]").prop("checked"));
  var display = $("[payment=usdt_trc20][name=display]").val()
  var fee = String(Number($("[payment=usdt_trc20][name=fee]").val()).toFixed(2))
  var api = $("[payment=usdt_trc20][name=api]").val()
  var token = $("[payment=usdt_trc20][name=token]").val()

  if ((enable == "true") && (!display || !api || !token)) {
    sendmsg("请填写完全部内容或关闭当前支付方式");
    return;
  }

  $.ajax({
    method: "POST",
    url: "/ajax/admin/settings/payments?type=usdt_trc20",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify({
      enable: enable,
      display: display,
      fee: fee,
      api: api,
      token: token,
    }),
  })
    .done(function (response) {
      sendmsg(response.Msg);
    })
    .fail(function () {
      sendmsg("请求失败, 请检查网络是否正常");
    });
});


$.ajax({
  method: "GET",
  url: "/ajax/admin/settings",
  dataType: "json",
})
  .done(function (response) {
    if (response.Ok) {
      $("#version").html(response.Data.version);
      $("#system_url").val(response.Data.system_url);
      $("#license").val(response.Data.license);
      $("#secure_key").val(response.Data.secure_key);
      $("#certificate").val(response.Data.certificate);
      $("#certificate_key").val(response.Data.certificate_key);

      $("#register").prop('checked', response.Data.register == "true");
      $("#register_recaptcha").prop('checked', response.Data.register_recaptcha == "true");
      $("#recaptcha_public").val(response.Data.recaptcha_public);
      $("#recaptcha_private").val(response.Data.recaptcha_private);

      $.ajax({
        method: "GET",
        url: "/ajax/admin/settings/payments",
        dataType: "json",
      })
        .done(function (response) {
          if (response.Ok) {
            $("[payment=whmcs][name=enable]").attr('checked', response.Data.whmcs.enable == "true");
            $("[payment=whmcs][name=display]").val(response.Data.whmcs.display);
            $("[payment=whmcs][name=fee]").val(response.Data.whmcs.fee);
            $("[payment=whmcs][name=api]").val(response.Data.whmcs.api);
            $("[payment=whmcs][name=secret]").val(response.Data.whmcs.secret);

            $("[payment=alipay_qr][name=enable]").attr('checked', response.Data.alipay_qr.enable == "true");
            $("[payment=alipay_qr][name=display]").val(response.Data.alipay_qr.display);
            $("[payment=alipay_qr][name=fee]").val(response.Data.alipay_qr.fee);
            $("[payment=alipay_qr][name=appid]").val(response.Data.alipay_qr.appid);
            $("[payment=alipay_qr][name=public_key]").val(response.Data.alipay_qr.public_key);
            $("[payment=alipay_qr][name=private_key]").val(response.Data.alipay_qr.private_key);

            $("[payment=epay][name=enable]").attr('checked', response.Data.epay.enable == "true");
            $("[payment=epay][name=display]").val(response.Data.epay.display);
            $("[payment=epay][name=fee]").val(response.Data.epay.fee);
            $("[payment=epay][name=api]").val(response.Data.epay.api);
            $("[payment=epay][name=id]").val(response.Data.epay.id);
            $("[payment=epay][name=key]").val(response.Data.epay.key);

            var methods = response.Data.epay.methods.split("|")
            if (methods.indexOf("qqpay") != -1) {
              $("[payment=epay][method=qqpay]").prop("checked", true);
            }

            if (methods.indexOf("wxpay") != -1) {
              $("[payment=epay][method=wxpay]").prop("checked", true);
            }

            if (methods.indexOf("alipay") != -1) {
              $("[payment=epay][method=alipay]").prop("checked", true);
            }

            $("[payment=mgate][name=enable]").attr('checked', response.Data.mgate.enable == "true");
            $("[payment=mgate][name=display]").val(response.Data.mgate.display);
            $("[payment=mgate][name=fee]").val(response.Data.mgate.fee);
            $("[payment=mgate][name=api]").val(response.Data.mgate.api);
            $("[payment=mgate][name=app_id]").val(response.Data.mgate.app_id);
            $("[payment=mgate][name=app_secret]").val(response.Data.mgate.app_secret);

            $("[payment=usdt_trc20][name=enable]").attr('checked', response.Data.usdt_trc20.enable == "true");
            $("[payment=usdt_trc20][name=display]").val(response.Data.usdt_trc20.display);
            $("[payment=usdt_trc20][name=fee]").val(response.Data.usdt_trc20.fee);
            $("[payment=usdt_trc20][name=api]").val(response.Data.usdt_trc20.api);
            $("[payment=usdt_trc20][name=token]").val(response.Data.usdt_trc20.token);
            done();
          } else sendmsg(response.Msg);
        })
        .fail(function () {
          sendmsg("请求失败, 请检查网络是否正常");
        });
    } else sendmsg(response.Msg);
  })
  .fail(function () {
    sendmsg("请求失败, 请检查网络是否正常");
  });

