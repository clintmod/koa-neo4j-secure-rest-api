const bcrypt = require('bcrypt');
const users = [
  {
    username: 'admin',
    password: '$2a$05$XUyHEpCGlAbXyJxJjfmzduC0WaM/PJcdURRMb7ve0F35ZzM1cENdC',
    email: 'admin@my.api',
    name: 'Admin',
    role: 'admin'
  }
];
const jsonwebtoken = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'jwt_secret';

async function create(ctx, next) {
  if (!ctx.request.body.username || !ctx.request.body.password || !ctx.request.body.email || !ctx.request.body.name) {
    ctx.status = 400;
    ctx.body = {
      error: 'expected an object with username, password, email, name but got: ' + ctx.request.body
    }
    return;
  }

  ctx.request.body.password = await bcrypt.hash(ctx.request.body.password, 5);

  const user = getUserByUsername(ctx.request.body.username, users);
  if (!user) {
    users.push(ctx.request.body);
    ctx.status = 200;
    ctx.body = {
      message: "success"
    };
    return next();
  } else {
    ctx.status = 406;
    ctx.body = {
      error: "User exists"
    }
    return;
  }
}

async function del(ctx) {
  if (!ctx.request.body.username) {
    ctx.status = 400;
    ctx.body = {
      error: 'Expected an object with username, password, email, name but got: ' + ctx.request.body
    }
    return;
  }
  let user = getUserByUsername(ctx.request.body.username, users);
  if (user) {
    users.splice(users.indexOf(user), 1);
    ctx.status = 200;
    ctx.body = {
      message: "success"
    };
  } else {
    ctx.status = 200;
    ctx.body = {
      message: "user not found"
    };
  }
}

async function login(ctx, next) {
  let user = await getUserByUsername(ctx.request.body.username, users);
  if (!user) {
    ctx.status = 401;
    ctx.body = {
      error: "bad username"
    }
    return;
  }
  const {
    password,
    ...userInfoWithoutPassword
  } = user;
  if (await bcrypt.compare(ctx.request.body.password, password)) {
    ctx.body = {
      token: jsonwebtoken.sign({
        data: userInfoWithoutPassword,
        //exp in seconds
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 60 seconds * 60 minutes = 1 hour
      }, secret)
    }
    return next();
  } else {
    ctx.status = 401;
    ctx.body = {
      error: "bad password"
    }
    return;
  }
};

function getUserByUsername(username, users) {
  let user;
  for (let i = 0; i < users.length; i++) {
    user = users[i];
    if (user.username === username) {
      return user;
    }
  }
  return null;
}

module.exports.create = create;
module.exports.login = login;
module.exports.del = del;