const database = require('better-sqlite3');
const db = new database('users/db');

db.exec(`
    create table if not exists users (
    id integer primary key autoincrement,
    username text unique not null,
    password text not  null,
    role text notnull)
`);

const count = db.prepare('select count(*) as total from users');

if (count.n === 0){
    const insert = db.prepare('insert into users (username, password, role) values (?, ?, ?)');

    insert.run('kamal', '1234', 'admin');
    insert.run('nimal', 'abcd', 'student');
    console.log('✅ database with two seeds...!');
    
}

console.log('✅ database connect and ready..!');
module.exports = db;
