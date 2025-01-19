const { addData } = require("../../functions/db");
const { authenticate } = require("../../functions/token");

const addEmployee = async (req, resp) => {
  try {
    const admin = await authenticate(req, resp);

    await addData({ ...req.body, admin }, "employees");

    resp.suc();
  } catch (err) {
    console.log("��� ~ file: addAdmin.js:3 ~ addAdmin ~ err:", err);
    resp.fail();
  }
};

module.exports = addEmployee;
