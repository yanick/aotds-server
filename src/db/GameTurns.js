import { Model } from 'objection';
import fp from 'lodash/fp';
import Battle from 'aotds-battle';

const debug = require('debug')('aotds:rest:db');

export default class GameTurns extends Model {
  static tableName = 'game_turns';

  static get idColumn() { return [ 'name', 'turn' ]; }

  static get jsonAttributes() { return [ 'state' ] }

  static async current_games() {
      let rows = await GameTurns.query().distinct('name').select();
      debug(rows);

      return rows.map( ({name}) => GameTurns.get_battle(name) );
  }

  static get_battle( name, turn ) {
        let query = GameTurns.query().where({ name });

        query = fp.isNil(turn) ? query.orderBy('turn','desc')
          :  query.andWhere({ turn });

        return query.first().then( ({state}) => {
            let battle = new Battle(state);

            let previous_turn = battle.state.game.turn;

            battle.save = () => {
                let state = battle.state;

                if( state.game.turn === previous_turn ) {
                    return GameTurns.query()
                        .update({state})
                        .where({ name: state.game.name, turn: state.game.turn });
                }

                previous_turn = state.game.turn;

                return GameTurns.query().insert({
                    ...fp.pick(['name','turn'])(state.game), state});
            };

            return battle;
        });

  }

}
