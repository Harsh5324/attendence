const mysql = require("mysql2");
const configs = require("../configs");

const dbConf = configs.db;

const db = mysql.createConnection({
  host: dbConf.host,
  user: dbConf.username,
  password: dbConf.password,
  database: dbConf.name,
});

const isISODateTimeString = (str) => {
  const isoDateTimeRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?$/;
  return isoDateTimeRegex.test(str);
};

const getData = (data, table, q, page, numOfItem, orderBy, isAnc) =>
  new Promise(async (resolve, reject) => {
    let query = `select ${data || "*"} from ${table}`;

    if (q) query += ` where ${q}`;

    if (page && numOfItem && orderBy)
      query += ` order by ${orderBy} ${
        isAnc ? "asc" : "desc"
      } limit ${numOfItem} offset ${(page - 1) * numOfItem}`;

    if (!page && !numOfItem && orderBy) {
      query += ` order by ${orderBy} desc`;
    }

    db.query(query, (err, res) => {
      if (err) {
        console.log("🚀 ~ file: getData.js:13 ~ db.query ~ err:", err);
        return reject({ status: "FAILURE" });
      } else {
        return resolve(res);
      }
    });
  });

const addData = (data, table, q) =>
  new Promise(async (resolve, reject) => {
    let query = `INSERT INTO ${table} SET ?`;

    if (q) {
      query += ` WHERE ${q}`;
    }

    if (data._id) {
      const id = data._id;
      delete data._id;
      query = `UPDATE ${table} SET ? WHERE _id = ${id}`;
    }

    // Format datetime values
    for (const key in data) {
      if (
        Object.prototype.hasOwnProperty.call(data, key) &&
        typeof data[key] === "string" &&
        isISODateTimeString(data[key])
      ) {
        data[key] = new Date(data[key])
          .toISOString()
          .slice(0, 19)
          .replace("T", " ");
      }
    }

    db.query(query, data, (err, res) => {
      if (err) {
        console.error("Error executing query:", err);
        reject({ status: "FAILURE" });
      } else {
        if (!data._id) {
          resolve(res.insertId);
        } else {
          resolve();
        }
      }
    });
  });

const deleteData = async (_id, table) =>
  new Promise(async (resolve, reject) => {
    db.query(`delete from ${table} where _id = ${_id}`, (err) => {
      if (err) {
        reject({ status: "FAILURE" });
      } else {
        resolve({ status: "SUCCESS" });
      }
    });
  });

module.exports = { db, getData, addData, deleteData };
