import request from 'supertest';
import App from './app';

const debug = require('debug')('aotds:sample-play');

let app = new App();
app.launch();

test( 'a simple game first turn', async() => {

    let resp = await request(app.server).get('/api/battle/epsilon');
    //.send( require( '../samples/game.json' ) ).set('Accept', 'application/json').expect(200);

    debug(resp);

});



