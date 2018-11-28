# 登录

- url： http://locahost:3000/api/login
- method: post
- params: 
  {
    username: 'xxx',
    password: 'xxx',
  }

- return: 
  {
    code: 0,   // 0代表成功
    msg： '', // 错误信息
    data: {}, // 用户登录成功的信息
  }