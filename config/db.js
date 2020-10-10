const mysql = require("mysql2");

const pool = mysql
  .createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_SCHEMA,
  })
  .promise();

module.exports = pool;

//REFERENCE FOR MYSQL

// const mysql = require("mysql");
// const util = require("util");

// const pool = mysql.createPool({
//   connectionLimit: 10,
//   host: "localhost",
//   port: 3306,
//   user: "root",
//   password: "mysql",
//   database: "test",
// });

// pool.getConnection((err, connection) => {
//   if (err) {
//     if (err.code === "PROTOCOL_CONNECTION_LOST") {
//       console.error("Database connection was closed.");
//     }
//     if (err.code === "ER_CON_COUNT_ERROR") {
//       console.error("Database has too many connections.");
//     }
//     if (err.code === "ECONNREFUSED") {
//       console.error("Database connection was refused.");
//     }
//   }
//   if (connection) {
//     console.log("SQL Connected");
//     connection.release();
//   }
//   return;
// });

// // Promisify for Node.js async/await.
// pool.query = util.promisify(pool.query);
// pool.getConnection = util.promisify(pool.getConnection);

// module.exports = pool;
