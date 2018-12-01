var express = require("express");
var app = express();
var async = require("async");
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb://127.0.0.1:27017";
var bodyParser = require("body-parser");
var multer = require("multer");
var upload = multer({ dest: "./img" });
var path = require("path");

var fs = require("fs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.set({
    "Access-Control-Allow-Origin": "*"
  });
  next();
});

//登录
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
              nickname: data[0].nickname,
              isAdmin: data[0].isAdmin
            };
          }
          client.close();
          res.json(results);
        });
    }
  );
});
//注册

app.post("/api/register", function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var nickname = req.body.nickname;
  var age = req.body.age;
  var sex = req.body.sex;
  var isAdmin = req.body.isAdmin === "是" ? true : false;

  var results = {};
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        results.code = -1;
        results.msg = "数据库连接失败";
        res.json(results);
        return;
      }

      var db = client.db("project");

      async.series(
        [
          function(cb) {
            db.collection("user")
              .find({ username: username })
              .count(function(err, num) {
                if (err) {
                  cb(err);
                } else if (num > 0) {
                  results.code = -1;
                  results.msg = "已经注册";
                  res.json(results);
                  cb(new Error("已经注册"));
                } else {
                  cb(null);
                }
              });
          },

          function(cb) {
            db.collection("user").insertOne(
              {
                username: username,
                password: password,
                nickname: nickname,
                isAdmin: isAdmin,
                age: age,
                sex: sex
              },
              function(err) {
                if (err) {
                  cb(err);
                } else {
                  cb(null);
                }
              }
            );
          }
        ],
        function(err, result) {
          if (err) {
            results.code = -1;
            results.msg = "注册失败";
            res.json(results);
          } else {
            results.code = 0;
            results.msg = "注册成功";
            res.json(results);
          }

          client.close();
        }
      );
    }
  );
});

//获取用户列表
app.get("/api/user/list", function(req, res) {
  var page = parseInt(req.query.page) || 1; // 页码
  var pageSize = parseInt(req.query.pageSize) || 5; // 每页显示的条数
  var totalSize = 0; // 总条数
  var data = [];
  var results = {};
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        results.code = -1;
        results.msg = "数据库连接失败";
        res.json(results);
        return;
      }
      var db = client.db("project");
      async.series(
        [
          function(cb) {
            db.collection("user")
              .find()
              .count(function(err, num) {
                if (err) {
                  cb(err);
                } else {
                  totalSize = num;
                  cb(null);
                }
              });
          },
          function(cb) {
            db.collection("user")
              .find()
              .limit(pageSize)
              .skip(page * pageSize - pageSize)
              .toArray(function(err, data) {
                if (err) {
                  cb(err);
                } else {
                  cb(null, data);
                }
              });
          }
        ],
        function(err, result) {
          if (err) {
            results.code = -1;
            results.msg = "查询失败";
            res.json(results);
          } else {
            totalPage = Math.ceil(totalSize / pageSize);

            results.code = 0;
            results.msg = "查询成功";
            results.data = {
              list: result[1],
              totalPage: totalPage,
              page: page
            };
          }
          client.close();
          res.json(results);
        }
      );
    }
  );
});
//删除用户
app.post("/api/user/list/remove", function(req, res) {
  var username = req.body.username;
  var results = {};
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        results.code = -1;
        results.msg = "连接失败";
        res.json(results);
        return;
      }
      var db = client.db("project");

      db.collection("user").deleteOne({ username: username }, function(
        err,
        data
      ) {
        if (err) {
          results.code = -1;
          results.msg = "删除失败";
          res.json(results);
        } else {
          results.code = 0;
          results.msg = "删除成功";
          res.json(results);
        }
      });
      client.close();
    }
  );
});
//搜索
app.post("/api/user/Search", function(req, res) {
  var Search_box = req.body.Search_box;

  var nickname = new RegExp(Search_box);
  var results = {};
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        results.code = -1;
        results.msg = "数据库连接失败";
        res.json(results);
        return;
      }

      var db = client.db("project");
      db.collection("user")
        .find({ nickname: nickname })
        .toArray(function(err, data) {
          if (err) {
            results.code = -1;
            results.msg = "查询失败";
            res.json(results);
          } else {
            results.code = 0;
            results.data = data;
            res.json(results);
          }
        });
      client.close();
    }
  );
});
//获取品牌数据
app.get("/api/brand/list", function(req, res) {
  var page = parseInt(req.query.page) || 1; // 页码
  var pageSize = parseInt(req.query.pageSize) || 5; // 每页显示的条数
  var totalSize = 0; // 总条数
  var data = [];
  var results = {};
  MongoClient.connect(
    url,
    {
      useNewUrlParser: true
    },
    function(err, client) {
      if (err) {
        results.code = -1;
        results.msg = "连接失败";
        res.json(results);
        console.log(2);
        return;
      }
      var db = client.db("project");
      async.series(
        [
          function(cb) {
            db.collection("brand")
              .find()
              .count(function(err, num) {
                if (err) {
                  cb(err);
                } else {
                  totalSize = num;
                  cb(null);
                }
              });
          },
          function(cb) {
            db.collection("brand")
              .find()
              .limit(pageSize)
              .skip(page * pageSize - pageSize)
              .toArray(function(err, data) {
                if (err) {
                  cb(err);
                } else {
                  cb(null, data);
                }
              });
          }
        ],
        function(err, result) {
          if (err) {
            results.code = -1;
            results.msg = "查询失败";
            res.json(results);
          } else {
            totalPage = Math.ceil(totalSize / pageSize);

            results.code = 0;
            results.msg = "查询成功";
            results.data = {
              list: result[1],
              totalPage: totalPage,
              page: page
            };
          }
          client.close();
          res.json(results);
        }
      );
    }
  );
});
//删除品牌
app.post("/api/brand/remove", function(req, res) {
  var name = req.body.username;
  var results = {};
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        results.code = -1;
        results.msg = "连接失败";
        res.json(results);
        return;
      }
      var db = client.db("project");

      db.collection("brand").deleteOne({ name: name }, function(err, data) {
        if (err) {
          results.code = -1;
          results.msg = "删除失败";
          res.json(results);
        } else {
          results.code = 0;
          results.msg = "删除成功";
          res.json(results);
        }
      });
      client.close();
    }
  );
});
//新增品牌
app.post("/api/brand/add", upload.single("file"), function(req, res) {
  var name = req.body.name;
  var FileName = new Date().getTime() + req.file.originalname;
  var newFileName = path.resolve(__dirname, "./images/", FileName);

  try {
    fs.renameSync(req.file.path, newFileName);

    MongoClient.connect(
      url,
      { useNewUrlParser: true },
      function(err, client) {
        if (err) {
          console.log("cg");
          return;
        }
        console.log("c1");
        var db = client.db("project");

        db.collection("brand").insertOne({
          src: newFileName,
          name: name
        });

        client.close();
      }
    );
  } catch (error) {
    if (error) {
      console.log("上传失败");
    } else {
      console.log("上传成功");
    }
  }
});
//获取手机列表
app.get("/api/phone/list", function(req, res) {
  var page = parseInt(req.query.page) || 1; // 页码
  var pageSize = parseInt(req.query.pageSize) || 5; // 每页显示的条数
  var totalSize = 0; // 总条数
  var data = [];
  var results = {};
  MongoClient.connect(
    url,
    {
      useNewUrlParser: true
    },
    function(err, client) {
      if (err) {
        results.code = -1;
        results.msg = "连接失败";
        res.json(results);
        console.log(2);
        return;
      }
      var db = client.db("project");
      async.series(
        [
          function(cb) {
            db.collection("phone")
              .find()
              .count(function(err, num) {
                if (err) {
                  cb(err);
                } else {
                  totalSize = num;
                  cb(null);
                }
              });
          },
          function(cb) {
            db.collection("phone")
              .find()
              .limit(pageSize)
              .skip(page * pageSize - pageSize)
              .toArray(function(err, data) {
                if (err) {
                  cb(err);
                } else {
                  cb(null, data);
                }
              });
          }
        ],
        function(err, result) {
          if (err) {
            results.code = -1;
            results.msg = "查询失败";
            res.json(results);
          } else {
            totalPage = Math.ceil(totalSize / pageSize);

            results.code = 0;
            results.msg = "查询成功";
            results.data = {
              list: result[1],
              totalPage: totalPage,
              page: page
            };
          }
          client.close();
          res.json(results);
        }
      );
    }
  );
});
//删除品牌
app.post("/api/phone/remove", function(req, res) {
  var name = req.body.username;
  var results = {};
  MongoClient.connect(
    url,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) {
        results.code = -1;
        results.msg = "连接失败";
        res.json(results);
        return;
      }
      var db = client.db("project");

      db.collection("phone").deleteOne({ name: name }, function(err, data) {
        if (err) {
          results.code = -1;
          results.msg = "删除失败";
          res.json(results);
        } else {
          results.code = 0;
          results.msg = "删除成功";
          res.json(results);
        }
      });
      client.close();
    }
  );
});
//新增手机
app.post("/api/phone/add", upload.single("file"), function(req, res) {
  var name = req.body.name;
  var brand = req.body.brand;
  var price = req.body.price;
  var Secondhandprice = req.body.ershouprice;
  var FileName = new Date().getTime() + req.file.originalname;
  var newFileName = path.resolve(__dirname, "./images/", FileName);

  try {
    fs.renameSync(req.file.path, newFileName);

    MongoClient.connect(
      url,
      { useNewUrlParser: true },
      function(err, client) {
        if (err) {
          return;
        }

        var db = client.db("project");

        db.collection("phone").insertOne({
          src: newFileName,
          name: name,
          brand: brand,
          price: price,
          Secondhandprice: Secondhandprice
        });

        client.close();
      }
    );
  } catch (error) {
    if (error) {
      console.log("上传失败");
    } else {
      console.log("上传成功");
    }
  }
});
//修改文件
app.post("/api/phone/update", function(req, res) {
  var name = req.body.name;
  var price = req.body.price;
  var brand = req.body.brand;
  var username = req.body.username;
  var Secondhandprice = req.body.Secondhandprice;
  console.log(req.body);
  var results = {};
  MongoClient.connect(
    url,
    {
      useNewUrlParser: true
    },
    function(err, client) {
      if (err) {
        return;
      }
      var db = client.db("project");

      db.collection("phone").updateOne(
        { name: username },
        {
          $set: {
            name: name,
            price: price,
            brand: brand,
            Secondhandprice: Secondhandprice
          }
        }
      );
      results.code = 0;
      results.msg = "修改成功";
      client.close();
      res.json(results);
    }
  );
});

app.listen(3000);
