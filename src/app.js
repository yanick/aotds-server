const Koa = require('koa');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');

import BattleDB from './db/battle';

let battle_db = new BattleDB( './battles.db' );
 
const app = new Koa();
 
app.use(logger());
app.use(bodyParser());

let router = new Router();

// create a brand-new battle
router.post('/api/battle', async (ctx, next) => {
    ctx.body =  ( await battle_db.create_battle(ctx.request.body) ).state;
    await next();
});

// get current round of that battle
router.get('/api/battle/:battle_name', async (ctx, next) => {
    ctx.body =  ( await battle_db.get_battle(ctx.params.battle_name) ).state;
    await next();
});

// post orders for the given ship
router.post('/api/battle/:battle_name/ship/:ship_id/orders', async (ctx, next) => {
    let battle = await battle_db.get_battle(ctx.params.battle_name);
    battle.post_orders( ctx.params.ship_id, ctx.request.body );
    ctx.body = battle.state;
    await next();
});




app.use(router.routes());


 
app.listen(3000);
