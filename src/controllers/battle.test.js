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

    create_battle( req, res, next  );

    let body = await res_promise;
    
    expect(body).toMatchObject({
        game: { name: 'epsilon', turn: 0 }
    });

    return;
});

test( 'create a game', create_game )

test( 'get battle', async () => {
    await create_game();

    let req = { params: { id: 'banana' } };

    let res_promise = new Promise( resolve => {
        let res = { send: resolve };
        get_battle(req,res,resolve);
    });

    let next = await res_promise;

    expect(next).toHaveProperty('isBoom', true );
    expect(next).toHaveProperty('output.statusCode', 404 );

    next = await new Promise( resolve => {
        let res = { send: resolve };
        get_battle({ params: { id: 'epsilon' } },res,resolve);
    });

    expect(next).toMatchObject({ game: { name: 'epsilon', turn: 0 }});

});
