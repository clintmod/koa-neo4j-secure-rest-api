'use strict';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const Koa = require('koa');
const jwt = require('koa-jwt');
const logger = require('koa-logger');
const KoaRouter = require('koa-router');
const koaBody = require('koa-body');
const tokenErrors = require('./middleware/token-errors');
const neo4jSessionCleanup = require('./middleware/neo4j-session-cleanup');
const responseTime = require('./middleware/response-time');
const adminRoleVerifier = require('./middleware/admin-role-verifier');
const user = require('./routes/user');
const index = require('./routes/index');
const node = require('./routes/node');
const relationship = require('./routes/relationship');

const secret = process.env.JWT_SECRET || 'jwt_secret';;

const app = new Koa();

app.use(responseTime);
if (process.env.NODE_ENV != 'test') {
  app.use(logger());
}
app.use(neo4jSessionCleanup);
app.use(tokenErrors);

app.use(jwt({secret: secret}).unless({
  path: ["/login", "/"]
}));

app.use(adminRoleVerifier);

app.use(koaBody());

// public routes
const pub = new KoaRouter();
pub.get('/', index.read);
pub.post('/login', user.login);
app.use(pub.routes());
app.use(pub.allowedMethods());

//private routes
const v1 = new KoaRouter({prefix: '/api/v1'});
//v1ApiRouter.get('/nodes', nodeRoutes.index);
v1.post('/node/create', node.create);
v1.post('/node/update', node.update);
v1.post('/node/delete', node.del);
v1.post('/node/read', node.read);
v1.post('/relationship/create', relationship.create);
v1.post('/relationship/update', relationship.update);
v1.post('/relationship/delete', relationship.del);
v1.post('/relationship/read', relationship.read);
app.use(v1.routes());
app.use(v1.allowedMethods());

const admin = new KoaRouter({prefix: '/admin'})
admin.post('/user/create', user.create)
admin.post('/user/delete', user.del)
app.use(admin.routes());
app.use(admin.allowedMethods());

module.exports = app;