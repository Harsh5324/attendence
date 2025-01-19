const { addData } = require("../../functions/db");
const { authenticate } = require("../../functions/token");

const addMachine = async (req, resp) => {
  try {
    const admin = await authenticate(req, resp);

    await addData({ ...req.body, admin }, "machines");

    resp.suc();
  } catch (err) {
    console.log("🚀 ~ file: addMachine.js:5 ~ addMachine ~ err:", err);
    resp.fail();
  }
};

module.exports = addMachine;
