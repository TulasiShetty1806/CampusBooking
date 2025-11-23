const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Deekshita@2008',
    database: 'campus_booking'
});

db.connect(err => {
    if(err) throw err;
    console.log('MySQL Connected');
});

module.exports = db;
