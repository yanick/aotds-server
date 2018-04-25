const Koa = require('koa');
const cors = require('@koa/cors');
import jwt from 'koa-jwt';

const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-oai-router');
const middleware = require('koa-oai-router-middleware');
import boom from 'boom';

import { Model } from 'objection';
import knexConfig from '../knexfile';
import Knex from 'knex';

import WSServer from './ws_server';

let ws_server = new WSServer({ 
    port: 3001,
});


const app = new Koa();

app.use( async(ctx,next) => {
    ctx.state.ws_server = ws_server;
    await next();
});

app.use(cors());

const knex = Knex(knexConfig.development);
Model.knex(knex);

const debug = require('debug')('aotds:rest');

// TODO move the secret to a config file
app.use(jwt({ secret: 'aotds', passthrough: true } ));
app.use(logger());
app.use(bodyParser());

app.use( async (ctx, next) => {
    try { await next() }
    catch(err) {
        debug(err);
        if( !err.isBoom ) {
            err = boom.badImplementation(err);
        }

        ctx.body = err.output.payload;
        ctx.status = err.output.statusCode;
        if( err.data ) {
            ctx.body.data = err.data;
        }
    }
});

const router = new Router({ apiDoc: './api', });

router.mount(middleware, './src/controllers');

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000, () => console.log( "good to go") );

