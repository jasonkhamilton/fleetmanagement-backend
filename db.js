// db.js

const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'fleetmanagement',
    password: 'fennec fox',
    port: 5433, // Change this if your PostgreSQL is running on a different port
});

module.exports = pool;
