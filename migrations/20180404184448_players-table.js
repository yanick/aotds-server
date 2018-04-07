
exports.up = function(knex, Promise) {
    return knex.schema.createTable('players', table => {
        table.string('name').notNullable();
        table.string('password').notNullable();
        table.integer('is_admin');
        table.primary('name');
    })
  
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('players');
  
};
