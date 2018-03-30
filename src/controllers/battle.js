//import battle_db from '../db/battle';


export async function create_battle(ctx,next) {
    console.log(ctx);
    console.log(ctx.battle_id);
//    ctx.body = battle_db.create(ctx.request.body);
    await next();
}

export async function get(ctx, next) {
    console.log(ctx.request.query);
    console.log(ctx);
  ctx.body = "works for me!";
//    ctx.body = battle_db.create(ctx.request.body);
    await next();
    console.log(ctx);
}

