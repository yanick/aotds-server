import PouchDB from 'pouchdb';

PouchDB.plugin(require('pouchdb-adapter-node-websql'));
PouchDB.plugin(require('pouchdb-find'));

class Battle {
    constructor(battle) {
        this.store = battle;
    }

    static create(battle) {
        return new Battle(battle);
    }

    post_orders( ship_id, orders ) {
    }

    get state() {
        console.log(this);
        return this.store;
    }
}


export default class BattleDB {

    constructor(filename) {
        this.db = new PouchDB('battles.db', {adapter: 'websql'});
        this.db.createIndex({ index: { fields: ['game.name','game.turn'] } });
    }

    async create_battle(battle) {
        let _id = battle.game.name + '/0';
        battle = new Battle(battle);
        await this.db.put({ _id, ...battle.store });
        return battle;
    }

    async get_battle(name) {
        let { docs: [ { _id: latest_id } ] } = await this.db.find({
            selector: { 'game.name': name },
            fields: ['_id', 'game.name', 'game.turn' ],
            sort: ['game.name',{'game.turn': 'desc'}]
        });

        return new Battle( await this.db.get(latest_id) );
    }

}


