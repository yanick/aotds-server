import { Model } from 'objection';
import fp from 'lodash/fp';

import bcrypt from 'bcrypt';

const debug = require('debug')('aotds:rest:db');

export default class Players extends Model {
  static tableName = 'players';

  static get idColumn() { return 'name'; }

  static async auth( name, password ) {
      let player = await Players.query().findById(name);
      if(!player) throw new Error("player does not exist");

      debug( password, player.password );
      await bcrypt.compare(password, player.password );

        return {
            player: name,
            is_admin: player.is_admin,
        };

  }

}
