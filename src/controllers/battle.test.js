import fp from 'lodash/fp';

import Knex from 'knex';
import { Model } from 'objection';

import { create_battle, get_battle } from './battle';
import GameTurns from '../db/GameTurns';

beforeAll( () => {
    let knex = Knex({
        client: 'sqlite3',
        connection: { filename: ':memory' }
    });
    
    knex.migrate.latest();

    Model.knex(knex);
});

let sample_game = {
    "game": { "name": "epsilon" },
    "objects": [ { "id": "enkidu" } ]
};

const debug = require('debug')('aotds:rest:battle');

const create_game = fp.memoize( async () => {
    let req = { body:  sample_game };
    let next = jest.fn();

    await GameTurns.query().delete().where( { name: 'epsilon' } );

    let res = {};
    let res_promise = new Promise( resolve => {
        res.send = body => resolve(body);
    });

    let ctx = { request: { body: sample_game } };

    await create_battle( ctx, () => 1 );

    expect(ctx.body).toMatchObject({
        game: { name: 'epsilon', turn: 0 }
    });
});

test( 'create a game', create_game )

test( 'get battle', async () => {
    await create_game();

    let ctx = { params: { battle_id: 'banana' } };

    await expect( get_battle(ctx, () => 1 ) ).rejects.toThrow(
    );

    ctx.params.battle_id = 'epsilon';
    let good = await get_battle(ctx, () => 1 );

    expect(good).toMatchObject({ game: { name: 'epsilon', turn: 0 }});

});
