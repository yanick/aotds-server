const debug = require('debug')('aotds:koa');

export async function create_battle(ctx,next) {
    debug("YES", ctx.params  );
    await next();
}

export async function get(ctx,next) {
    debug("YES", ctx.params  );
    ctx.body = { tomato: 'red' };
    await next();
}
