const neo4j = require('../services/neo4j')
const assert = require('assert');

async function read(ctx) {
  if (!isValidBody(ctx)) {
    return;
  }
  ctx.status = 200;
  ctx.body = {
    result: await neo4j.readNode(ctx.request.body.uid, ctx)
  };
}

async function create(ctx) {
  if (!isValidBody(ctx)) {
    return;
  }
  ctx.status = 200;
  ctx.body = {
    result: await neo4j.mergeNode(ctx.request.body, ctx)
  };
}

async function update(ctx) {
  if (!isValidBody(ctx)) {
    return;
  }
  ctx.status = 200;
  ctx.body = {
    result: await neo4j.mergeNode(ctx.request.body, ctx)
  };
}

async function del(ctx) {
  if (!isValidBody(ctx)) {
    return;
  }
  ctx.status = 200;
  ctx.body = {
    result: await neo4j.deleteNode(ctx.request.body.uid, ctx)
  };
}

function isValidBody(ctx) {
  if (!ctx.request.body.uid) {
    ctx.status = 400;
    ctx.body = {
      error: 'expected an object with uidLeft, uidRight, type, props but got: ' + JSON.stringify(ctx.request.body)
    }
    return false;
  }
  return true;
}

module.exports.read = read;
module.exports.create = create;
module.exports.update = update;
module.exports.del = del;