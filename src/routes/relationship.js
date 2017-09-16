const neo4j = require('../services/neo4j')

async function read(ctx) {
  if (!isValidParams(ctx)) {
    return;
  }
  ctx.status = 200;
  ctx.body = {
    result: await neo4j.readRelationship(ctx.params.uid, ctx)
  };
}

async function create(ctx) {
  if (!isValidBody(ctx)) {
    return;
  }
  ctx.status = 200;
  ctx.body = {
    result: await neo4j.createRelationship(ctx.request.body, ctx)
  };
}

async function update(ctx) {
  if (!isValidBody(ctx)) {
    return;
  }
  ctx.status = 200;
  ctx.body = {
    result: await neo4j.updateRelationship(ctx.request.body, ctx)
  };
}

async function del(ctx) {
  if (!isValidBody(ctx)) {
    return;
  }
  ctx.status = 200;
  ctx.body = {
    result: await neo4j.deleteRelationship(ctx.request.body, ctx)
  };
}

function isValidBody(ctx) {
  if (!ctx.request.body.uidLeft || !ctx.request.body.uidRight || !ctx.request.body.type || !ctx.request.body.props) {
    ctx.status = 400;
    ctx.body = {
      error: 'expected an object with uidLeft, uidRight, type, props but got: ' + JSON.stringify(ctx.request.body)
    }
    return false;
  }
  return true;
}

function isValidParams(ctx) {
  if (!ctx.params.uid) {
    ctx.status = 400;
    ctx.body = {
      error: 'expected a param of uid but got: ' + JSON.stringify(ctx.request.params)
    }
    return false;
  }
  return true;
}

module.exports.create = create;
module.exports.read = read;
module.exports.update = update;
module.exports.del = del;