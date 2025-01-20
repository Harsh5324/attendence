const { addData } = require("../../functions/db");
const { authenticate } = require("../../functions/token");

const addAdvance = async (req, resp) => {
  try {
    const { body } = req;

    if (parseFloat(body.amount) <= 0) return resp.fail("Invalid amount");

    body.admin = await authenticate(req, resp);

    await addData(body, "advance");

    resp.suc();
  } catch (err) {
    console.log("Error while adding advance:", err);
    resp.fail();
  }
};

module.exports = addAdvance;
