const knex = require('knex');
const config = require("../knexfile");
const environment = process.env.NODE_ENV || 'development';
//db is a knex instance
const db = knex(config[environment]);

module.exports = db;
