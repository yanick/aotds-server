import u from 'updeep';

import GameTurns from '../db/GameTurns';
import Battle from 'aotds-battle';

import boom from 'boom';

const debug = require('debug')('aotds:rest');

function _play_turn( battle, force = false ) {
    let turn = battle.state.game.turn;

    battle.play_turn(force);

    return battle.state.game.turn > turn;
}

export const play_turn = async(ctx,next) => {
    let { battle_id } = ctx.params;

    let battle = await GameTurns.get_battle(battle_id);

    if( _play_turn( battle, ctx.query.force ) ) {
        ctx.status = 201;
        await battle.save(); 

        debug( "here we should tell the world!" );
        ctx.state.ws_server.new_turn(battle.state.game.name);
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

    ctx.state.battle = battle;

    battle.set_orders( ship_id, orders );

    try { await battle.save(); }
    catch(e) { throw e }

    ctx.body = battle.state.objects.find( o => o.id === ship_id );

    if( _play_turn( battle ) ) {
        await battle.save(); 
        ctx.state.ws_server.new_turn(battle.state.game.name);
    }

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
