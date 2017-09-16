module.exports = async function (ctx, next) {
  try {
    await next();
  } catch (err) {
    if (err.status === 401) {
      ctx.status = 401;
      let errMessage = err.originalError
        ? err.originalError.message
        : err.message
      ctx.body = {
        error: errMessage
      };
      ctx.set("X-Status-Reason", errMessage)
    } else {
      ctx
        .app
        .emit('error', err, ctx);
    }
  }
}