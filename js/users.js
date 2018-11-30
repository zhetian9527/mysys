$(function() {
  getList();

  $("#search").click(function() {
    var Search_box = $("#Search_box").val();

    $.post(
      "http://127.0.0.1:3000/api/user/Search",
      {
        Search_box: Search_box
      },
      function(res) {
        if (res.code == 0) {
          var list = res.data[0];

          var str = "";

          str +=
            "<tr><td>" +
            list.username +
            "</td> <td>" +
            list.nickname +
            "</td><td>" +
            list.age +
            "</td> <td>" +
            list.sex +
            "</td><td>" +
            list.isAdmin +
            "</td> <td><a class='remove'  >删除</a></td> </tr>";

          $("#tbody").html(str);
        }
      }
    );
    return false;
  });
});

// 获取用户列表
function getList(page, pageSize) {
  if (location.search) {
    page1 = location.search
      .split("?")[1]
      .split("&")[0]
      .split("=")[1];
  } else {
    page1 = 1;
  }
  page = page || page1;
  pageSize = pageSize || 5;

  $.get(
    "http://127.0.0.1:3000/api/user/list",
    {
      page: page,
      pageSize: pageSize
    },
    function(res) {
      if (res.code === 0) {
        var list = res.data.list;

        var str = "";
        for (var i = 0; i < list.length; i++) {
          str +=
            "<tr><td>" +
            list[i].username +
            "</td> <td>" +
            list[i].nickname +
            "</td><td>" +
            list[i].age +
            "</td> <td>" +
            list[i].sex +
            "</td><td>" +
            list[i].isAdmin +
            "</td> <td><a class='remove'  >删除<a/></td> </tr>";
        }

        $("#tbody").append(str);

        var str1 = "";
        for (var i = 0; i < res.data.totalPage; i++) {
          str1 +=
            "<li><a  class='page1' href = 'users.html?page=" +
            (i + 1) +
            "&pageSize=5' >" +
            (i + 1) +
            "</a></li>";
        }

        $(".page li:eq(0)").after(str1);
        $(".page1").click(function() {
          var page = location.search
            .split("?")[1]
            .split("&")[0]
            .split("=")[1];
          getList(page);
        });

        $(".remove").click(function() {
          var username = $(this)
            .parent()
            .parent()
            .children()
            .eq(0)
            .text();

          $.post(
            "http://127.0.0.1:3000/api/user/list/remove",
            {
              username: username
            },
            function(res) {
              if (res.code == 0) {
                window.location.reload();
              }
            }
          );
        });
      } else {
        alert(res.msg);
      }
    }
  );
}
