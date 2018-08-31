import u from 'updeep';
import _ from 'lodash';

import * as battles from '../store/battles';

import boom from 'boom';

const debug = require('debug')('aotds:rest');

// returns `true` if the turn was played
function _play_turn( battle, force = false ) {
    let turn = battle.state.game.turn;

    battle.dispatch_action( 'play_turn', force);

    return battle.state.game.turn > turn;
}

export const play_turn = async(ctx,next) => {
    let { battle_id } = ctx.params;

    let battle = await retrieve_battle(ctx,battle_id);

    if( _play_turn( battle, ctx.query.force ) ) {
        ctx.status = 201;

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

async function retrieve_battle(ctx,name) {
    let battle = await battles.get_battle(
        ctx.params.battle_id, false 
    );

    if(!battle) throw boom.badRequest( "battle doesn't exist" );

    ctx.state.battle = battle;

    return battle;
}

export async function get_battle(ctx,next) {
    await retrieve_battle(ctx,ctx.params.battle_id);

    ctx.body = ctx.state.battle.state;

    await next();
}

export async function create_battle(ctx,next) {

    let name = _.get( ctx.request.body, 'game.name' );

    if(!name) {
        throw boom.badRequest( "no name provided" );
    }

    let battle = await battles.get_battle(name);

    if(battle.is_started) {
        throw boom.badRequest( "battle already created" );
    }

    battle.dispatch_action( 'init_game', ctx.request.body);

    ctx.body = battle.state;

    await next();
}
