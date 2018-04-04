import u from 'updeep';

import GameTurns from '../db/GameTurns';
import Battle from 'aotds-battle';

import boom from 'boom';

const debug = require('debug')('aotds:rest');

export const play_turn = async(ctx,next) => {
    let { battle_id } = ctx.params;
    debug( ctx.query );

    let battle = await GameTurns.get_battle(battle_id);

    let turn = battle.state.game.turn;

    battle.play_turn(ctx.query.force);

    if( battle.state.game.turn > turn ) {
        ctx.status = 201;
        await battle.save(); 
    }

    ctx.body = battle.state;

    await next();
};

export const post_orders = async(ctx,next) => {
    let { battle_id, ship_id } = ctx.params;
    let orders = ctx.request.body;

    let battle;
    try {
        battle = await GameTurns.get_battle(battle_id);
    }
    catch(e) {
        throw e;
    }

    battle.set_orders( ship_id, orders );

    try { await battle.save(); }
    catch(e) { throw e }

    ctx.body = { message: "orders sent" };

    await next();
};

export const get_battle = async (ctx,next) => {
    let turn = await GameTurns.query()
        .where({ name: ctx.params.battle_id })
        .orderBy('turn','desc')
        .first();

    if(!turn) throw boom.notFound( "game not found", {
        battle: ctx.params.battle_id
    } );

    ctx.body = turn.state;

    await next();

    return turn.state;
};


export async function create_battle(ctx,next) {
    let battle = new Battle();

    debug(ctx.request.body);
    battle.init_game(ctx.request.body);

    let state = battle.state;

    await GameTurns.query().insert({
        state,
            name: state.game.name,
            turn: state.game.turn,
        });
    
    ctx.body = state;

    await next();
}
