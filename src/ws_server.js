import _ from 'lodash';
import WebSocket from 'ws';

const debug = require('debug')('aotds:ws');

class WSServer {

    register_for_battle = ( id, ws ) => {
        debug( "registering for ", id );
        let battle = this.battles[id] || [];

        battle.push(ws);
        this.battles[id] = _.uniq(battle);
        debug.inspectOpts.depth = 2;
        debug(this.battles);
    };

    new_turn = battle => {
        let message = JSON.stringify({ type: 'NEW_TURN_AVAILABLE' });

        debug(this.ws);

        Array.from(this.ws.clients.values()).filter( c => c.battle === battle ).forEach( ws => {
            ws.send(message)} );
    };

    new_connection = ws => {
        debug( "got new connection!" );

        ws.on( 'message', message => {
            try { 
                let data = JSON.parse(message);
                if ( !data.battle ) return;

                ws.battle = data.battle;
            }
            catch(e) { }
        });

    };

    constructor({ port }) {
        this.port = port;
        this.battles = {};

        this.ws = new WebSocket.Server({ port, clientTracking: true });

        this.ws.on('connection', this.new_connection );
    }
}

export default WSServer;
