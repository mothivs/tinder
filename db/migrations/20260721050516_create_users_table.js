/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table){
        table.increments('id').primary();
        table.string('firstName').notNullable();
        table.string('lastName').notNullable();
        table.string('userName').unique().notNullable();
        table.string('password').notNullable();
        table.string('phoneNumber').unique().notNullable();
        table.string('gender');
        table.string('email').unique().notNullable();
        table.timestamps(true, true);   // created_at updated_at
      })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users')
};
