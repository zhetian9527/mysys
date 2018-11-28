var express = require("express");
var app = express();
var async = require("async");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://127.0.0.1:27017";
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.set({
    "Access-Control-Allow-Origin": "*"
  });
  next();
});
app.post("/api/login", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var results = {};
  MongoClient.connect(
    url,
    {
      useNewUrlParser: true
    },
    function(err, client) {
      if (err) {
        results.code = -1;
        results.msg = "数据库连接失败";
        res.json(results);
        return;
      }
      var db = client.db("project");
      db.collection("user")
        .find({
          username: username,
          password: password
        })
        .toArray(function(err, data) {
          if (err) {
            results.code = -1;
            results.msg = "查询失败";
          } else if (data.length <= 0) {
            results.code = -1;
            results.msg = "用户名或密码错误";
          } else {
            results.code = 0;
            results.msg = "登录成功";
            results.data = {
              nickname: data[0].nickname
            };
          }
          client.close();
          res.json(results);
        });
    }
  );
});

app.listen(3000);
