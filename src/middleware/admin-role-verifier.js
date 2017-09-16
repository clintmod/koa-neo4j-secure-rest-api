module.exports = async(ctx, next) => {
  //only handle /admin routes
  if (ctx.request.url.indexOf('/admin') != 0) {
    return next();
  }
  if (!ctx.state.user || !ctx.state.user.data || ctx.state.user.data.role != 'admin') {
    ctx.throw(401, 'admin required');
  }
  return next();
}