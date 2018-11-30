$(function() {
  $("input[type=radio]").click(function() {
    $("input[type=radio]").removeAttr("aaa");
    $(this).attr("aaa", "1");
  });
  $("#btn").click(function() {
    $.post(
      "http://localhost:3000/api/register",
      {
        username: $("input[type=text]").val(),
        password: $("input[type=password]").val(),
        nickname: $("#nickname").val(),
        isAdmin: $("input[aaa]").val(),
        age: $("#age").val(),
        sex: $("#sex").val()
      },
      function(res) {
        if ((res.code = -1)) {
          alert(res.msg);
          location.href = "login.html";
        } else {
          alert(res.msg);
        }
      }
    );
  });
});
