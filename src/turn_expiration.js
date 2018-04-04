import GameTurns from './db/GameTurns';
import fp from 'lodash/fp';

let scheduled = {};

const debug = require('debug')('aotds:rest:schedule');

async function play_scheduled(name,turn) {
    let game = await GameTurns.get_battle(name);
    if(!game) return;

    debug( "doing the scheduled thing for ", name );

    // oooh, I see potential for race conditions in there...
    if( game.turn === turn ) {
        debug( "YAY" );
        await game.play_turn(true);
        await game.save();
    }
    schedule_expiration(game);
}

export async function schedule_expiration(battle) {
    debug( "scheduling expiration for ", battle.name );

    if( scheduled[ battle.name ] ) {
        // cancel the old one
        clearTimeout(scheduled[battle.name]);
    }

    let deadline = fp.get( 'game.turn_times.deadline' )( battle.state );

    if(!deadline) {
        debug( "has no deadline, skipping");
        return;
    }

    deadline = Date.parse(deadline);

    let now = new Date();
    let time_left = deadline - now;
    debug(time_left);

    scheduled[battle.name] = setTimeout( play_scheduled,
        time_left, battle.name, battle.turn );

    scheduled[battle.name].unref();
}

export async function schedule_expirations() {
    let games = await GameTurns.current_games();

    for ( let game of games ) {
        game = await game
        debug( "game is ", game.name );
        schedule_expiration( await game );
        debug( "done" );
    }

    return;
}

