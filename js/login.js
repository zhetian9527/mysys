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
          localStorage.setItem("isAdmin", res.data.isAdmin);
        } else {
          alert(res.msg);
        }
      }
    );
    return false;
  });

  $("#btn1").click(function() {
    location.href = "register.html";
    return false;
  });
});
