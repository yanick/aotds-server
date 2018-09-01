import { LocalStorage } from 'node-localstorage';
import _ from 'lodash';

import bcrypt from 'bcrypt';

const debug = require('debug')('aotds:rest:db');

export default class Players {

    constructor(path) {
        if(!path) throw new Error('need a path');

        this.storage = new  LocalStorage('./player_store');
    }

    set( player ) {
        this.storage.setItem( player.player_id, JSON.stringify(player) );
    }

    async auth( name, password ) {
        let player = JSON.parse(this.storage.getItem(name));

        if(!player) throw new Error("player does not exist");

        debug( password, player.password );
        let verdict = await bcrypt.compare(password, player.password );

        if(!verdict) throw new Error("wrong password");

        return _.omit( player, [ 'password' ] );
    }
}
