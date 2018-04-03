import u from 'updeep';

import GameTurns from '../db/GameTurns';
import Battle from 'aotds-battle';

import boom from 'boom';

const debug = require('debug')('aotds:rest');

const asyncMW = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch((err) => {
        debug(err);
        err.isBoom ? next(err) : next(boom.badImplementation(err)) ;
    });

export const post_orders = asyncMW( async(req,res) => {
    let { battle_id, object_id } = req.params;
    let orders = req.body;

    let battle;
    try {
        battle = await GameTurns.get_battle(battle_id);
    }
    catch(e) {
        throw e;
    }

    debug(req.params);

    battle.set_orders( object_id, orders );

    try { await battle.save(); }
    catch(e) { throw e }

    res.json({ message: "orders sent" });
});

export const get_battle = asyncMW( async (req,res) => {
    debug(req);

    let turn = await GameTurns.query()
        .where({ name: req.params.id })
        .orderBy('turn','desc')
        .first();

    if(!turn) throw boom.notFound( "game not found", {
        battle: req.params.id
    } );

    res.send( turn.state );
});


export function create_battle(res,resp,next) {
    let battle = new Battle();

    debug(res.body);


    battle.init_game(res.body);

    let state = battle.state;

    debug(state);

    GameTurns.query().insert({
        state,
            name: state.game.name,
            turn: state.game.turn,
        }).then(() => {
            resp.send( state );
        })
}

export const update_swagger = u( {paths: 
    { 
        "/battle/:battle_id/object/:object_id/orders": {
            post: {
                'x-swagger-router-controller': 'battle',
                'operationId': 'post_orders',
                description: "send orders to a ship",
                parameters: [ 
                    {
                        name: 'battle_id',
                        in: 'path',
                        description: "name of the battle",
                        schema: { type: 'string' },
                    },
                    {
                        name: 'object_id',
                        in: 'path',
                        description: "id of the ship",
                        schema: { type: 'string' },
                    },
                    {
                        name: 'orders',
                        in: 'body',
                        description: "orders for the ship",
                    }
                ],
            },
        },
        "/battle/:id": {
            get: {
                'x-swagger-router-controller': 'battle',
                'operationId': 'get_battle',
                description: "retrieve the current turn of the game",
                parameters: [ 
                    {
                        name: 'id',
                        in: 'path',
                        description: "name of the battle",
                        schema: { type: 'string' },
                    }
                ],
            },
        },
        "/battle": {
            post: {
                'x-swagger-router-controller': 'battle',
                'operationId': 'create_battle',
                description: "create a new battle",
                parameters: [{
                    name: "game",
                    in: "body",
                    schema: { 
                        description: 'see http://aotds.babyl.ca/game',
                        type: 'object',
                    },
                }],
            },
}}}); 
