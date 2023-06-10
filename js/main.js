(function($) {

	"use strict";

	$(".toggle-password").click(function() {

  $(this).toggleClass("fa-eye fa-eye-slash");
  var input = $($(this).attr("toggle"));
  if (input.attr("type") == "password") {
    input.attr("type", "text");
  } else {
    input.attr("type", "password");
  }
});

})(jQuery);

// function loadData() {
//     let user = document.getElementById("username");
//     let password = document.getElementById("password");
//     const xhttp = new XMLHttpRequest();
//     xhttp.onload = () => {
//         let response = JSON.parse(xhttp.responseText);
//         let access_token = response.access_token;
//         localStorage.setItem("token", access_token);
//         if (xhttp.status == 200) {
//             window.location.href = "../users.html";
//         } else {
//             showError(user, "Tài khoản đăng nhập không chính xác");
//             showError(password, "Mật khẩu không chính xác");
//         }
//     }
//     xhttp.open("POST", "https://httpdl.howizbiz.com/api/web-authenticate");
//     xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
//     xhttp.send("username=" + user.value + "&password=" + password.value);
// }
//
// báo lỗi truy cập
// function showError(input, message) {
//     let parent = input.parentElement;
//     let span = document.createElement("span");
//     let children = parent.appendChild(span);
//     children.classList.add("error");
//     children.innerText = message;
// }

// function checkLoginStatus() {
//     let token = localStorage.getItem("token");
//     if (token) {
//         window.location.href = "../users.html";
//     }
// }
// checkLoginStatus();