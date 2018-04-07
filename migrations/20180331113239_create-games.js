exports.up = function (knex, Promise) {
    return knex.schema.createTable('game_turns', table => {
        table.string('name').notNullable();
        table.integer('turn').unsigned().notNullable();
        table.json('state').notNullable();
        table.primary(['name','turn']);
    })
};

exports.down = function down(knex, Promise) {
    return knex.schema.dropTable('game_turns');
};
