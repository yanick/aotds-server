import fp from 'lodash/fp';

import { create_battle, get_battle } from './battle';
import * as battles from '../store/battles';

import Battle from 'aotds-battle';

const debug = require('debug')('aotds:rest:battle');

battles.get_battle = jest.fn();

test( 'get unknown battle', async () => {

    battles.get_battle.mockReturnValueOnce(null);

    let ctx = { state: { }, params: { battle_id: 'epsilon' } };

    await expect( get_battle(ctx, () => 1 ) ).rejects.toThrow();
});

test( 'get known battle', async () => {

    let state = { game: { name: 'epsilon', turn: 0 }};
    battles.get_battle.mockReturnValueOnce(new Battle({ state} ) );

    let ctx = { state: { }, params: { battle_id: 'epsilon' } };

    await get_battle(ctx, () => 1 );

    expect(ctx.body).toMatchObject(state);

});
