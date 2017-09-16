module.exports = async function (ctx, next) {
  try {
    await next();
    if (ctx.neo4jSession) {
      ctx
        .neo4jSession
        .close();
    }
  } catch (err) {
    ctx
      .neo4jSession
      .close();
    ctx
      .app
      .emit('error', err, ctx);
  }
}