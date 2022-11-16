var theme = Number(localStorage.getItem("theme")) || 0;

if (theme) {
  document.body.classList.add("mdui-theme-layout-dark");
  document.body.classList.add("mdui-theme-primary-grey");
} else {
  document.body.classList.add("mdui-theme-primary-indigo");
  document.body.classList.add("mdui-theme-layout-light");
}

$("#change_theme").on("click", function () {
  if (theme) {
    document.body.classList.remove("mdui-theme-layout-dark");
    document.body.classList.remove("mdui-theme-primary-grey");
    document.body.classList.add("mdui-theme-primary-indigo");
    document.body.classList.add("mdui-theme-layout-light");
  } else {
    document.body.classList.remove("mdui-theme-layout-light");
    document.body.classList.add("mdui-theme-layout-dark");
    document.body.classList.remove("mdui-theme-primary-indigo");
    document.body.classList.add("mdui-theme-primary-grey");
  }
  theme ^= 1;
  localStorage.setItem("theme", theme);
});

if (window.innerWidth < 1023) {
  $("#main-drawer").addClass("mdui-drawer-close");
} else {
  $("#main-drawer").addClass("mdui-drawer-open");
}

$(window).resize(function () {
  if (window.innerWidth < 1023) {
    if ($("#main-drawer").hasClass("mdui-drawer-open")) {
      $("#main-drawer").removeClass("mdui-drawer-open");
    }
    if (!$("#main-drawer").hasClass("mdui-drawer-close")) {
      $("#main-drawer").addClass("mdui-drawer-close");
    }
  } else {
    if ($("#main-drawer").hasClass("mdui-drawer-close")) {
      $("#main-drawer").removeClass("mdui-drawer-close");
    }
    if (!$("#main-drawer").hasClass("mdui-drawer-open")) {
      $("#main-drawer").addClass("mdui-drawer-open");
    }
  }
});

$("li[href]").each(function (_, _) {
  $(this).on("click", function () {
    window.location.href = $(this).attr("href");
  });
});