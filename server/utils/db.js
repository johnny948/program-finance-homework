const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    port: 3307,
    password: '1234',
    database: 'Stock_analysis_system',
});

module.exports = { pool };
