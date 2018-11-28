$(function() {
  $("#btn").click(function() {
    $.post(
      "http://localhost:3000/api/login",
      {
        username: $("input[type=text]").val(),
        password: $("input[type=password]").val()
      },
      function(res) {
        console.log(res);
        if (res.code === 0) {
          console.log(res);
          // 成功
          alert("登录成功");
          location.href = "index.html";
          // 用 localStorage
          localStorage.setItem("nickname", res.data.nickname);
        } else {
          alert(res.msg);
        }
      }
    );
  });
});

// (function() {

//   var login = {
//     el: {
//       loginBtn: null
//     }, // 放DOM元素   DOM元素缓存

//     init: function() {
//       this.loginBtn = $('#btn')
//     }
//   };

//   $(function () {
//     btnEl.click

//     btnEl
//   })

// })()
