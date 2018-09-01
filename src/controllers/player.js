import u from 'updeep';

import boom from 'boom';

import jwt from 'jsonwebtoken';

const debug = require('debug')('aotds:rest');

export async function auth( ctx, next ) {
    let { player_id } = ctx.params;
    debug( ctx.state.user );
    let { password } = ctx.request.body;

    debug( "p: %s, p %s", player_id, password );

    try{
        let info = await ctx.state.players.auth( player_id, password );
        debug(info);
        if(!info) throw new Error();

        ctx.body = { token: jwt.sign(info, 'aotds' ) };
    } 
    catch(e) {
        throw boom.unauthorized();
    }

    await next();
}
