const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '10.0.4.11',      // 内网 IP
  port: 3306,
  user: 'root',   // 数据库用户名
  password: 'Kj123654##', // 数据库密码
  database: 'kerun', // 数据库名
  waitForConnections: true,
  connectionLimit: 10,     // 最大连接数
  queueLimit: 0
});

module.exports = pool;
