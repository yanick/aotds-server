import u from 'updeep';

import Players from '../db/players';

import boom from 'boom';

import jwt from 'jsonwebtoken';

const debug = require('debug')('aotds:rest');

export async function auth( ctx, next ) {
    let { player_id } = ctx.params;
    debug( ctx.state.user );
    let { password } = ctx.request.body;

    try{
        let info = await Players.auth( player_id, password );
        if(!info) throw new Error();

        ctx.body = { token: 
            jwt.sign(info, 'aotds' ),
        };
    } 
    catch(e) {
        throw boom.unauthorized();
    }

    await next();
}
