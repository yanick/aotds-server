const Koa = require('koa');
const cors = require('@koa/cors');
import jwt from 'koa-jwt';
import _ from 'lodash';

const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-oai-router');
const middleware = require('koa-oai-router-middleware');
import boom from 'boom';

import Players from './store/players';

import WSServer from './ws_server';

const debug = require('debug')('aotds:rest');

export default class App {
    constructor(config={}) {
        this.config = _.defaults(config,{
            player_store: './player_store',
        });
        this.app = new Koa();
        this.apply_middlewares();
        this.player_store = new Players(this.config.player_store);
    }

    apply_middlewares() {

        this.app.use( async(ctx,next) => {
            ctx.state.players = this.player_store;
            await next();
        });

        if( this.config.ws_server ) {
            this.app.use( async(ctx,next) => {
                ctx.state.ws_server = this.ws_server;
                await next();
            });
        }

        this.app.use(cors());

        // TODO move the secret to a config file
        this.app.use(jwt({ secret: 'aotds', passthrough: true } ));
        this.app.use(logger());
        this.app.use(bodyParser());

        // error catching
        this.app.use( async (ctx, next) => {
            try { await next() }
            catch(err) {
                if( !err.isBoom ) {
                    err = boom.badImplementation(err);
                }

                ctx.body = err.output.payload;
                ctx.status = err.output.statusCode;
                if( err.data ) {
                    ctx.body.data = err.data;
                }
                ctx.app.emit('error', err, ctx);
            }
        });

        this.app.on( 'error', (err,ctx) => {
            debug( "route error: %O", err);
        });

        const router = new Router({ apiDoc: './api', });
        router.mount(middleware, './src/controllers');

        this.app.use(router.routes());
        this.app.use(router.allowedMethods());

    }

    launch() {
        if( this.config.ws_server ) {
            this.ws_server = new WSServer( this.config.ws_server );
        }

        this.server = this.app.listen(
            this.config.port,
            () => console.log("app started")
        )
    }

}
