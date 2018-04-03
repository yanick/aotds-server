import { Model } from 'objection';
import fp from 'lodash/fp';
import Battle from 'aotds-battle';

const debug = require('debug')('aotds:rest:db');

export default class GameTurns extends Model {
  static tableName = 'game_turns';

  static get idColumn() { return [ 'name', 'turn' ]; }

  static get jsonAttributes() { return [ 'state' ] }

  static get_battle( name, turn ) {
        let query = GameTurns.query().where({ name });

      debug( "n+t ", name, " ", turn );
        query = fp.isNil(turn) ? query.orderBy('turn','desc')
          :  query.andWhere({ turn });

        return query.first().then( ({state}) => {
            debug( "___", state );
            let battle = new Battle(state);
            battle.save = () => {
                let state = battle.state;
                debug(state);
                return GameTurns.query()
                    .update({state})
                    .where({ name: state.game.name, turn: state.game.turn });
            };
            return battle;
        });

  }

}
