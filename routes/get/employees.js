const { getData } = require("../../functions/db");
const { authenticate } = require("../../functions/token");

const employees = async (req, resp) => {
  try {
    let { admin } = req.query;

    if (!admin) admin = await authenticate(req, resp);

    const data = await getData(null, "employees", `admin = ${admin}`);

    resp.suc(data);
  } catch (err) {
    console.log("🚀 ~ file: employees.js:5 ~ employees ~ err:", err);
    resp.fail();
  }
};

module.exports = employees;
