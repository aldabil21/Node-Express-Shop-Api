const db = require("../config/db");

const withTransaction = (fn) => async (...args) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const result = await fn(connection, ...args);
    return result;

    /* Make commit here if not returning new inserted/updated row */
    // const result = await fn(connection, ...args);
    // await connection.commit();
    // return result;
  } catch (err) {
    console.log(`ROLLING BACK: ERROR ${err}`);
    await connection.rollback();
    throw err;
  } finally {
    console.log("CONNECTION RELEASED");
    connection.release();
  }
};

module.exports = withTransaction;
