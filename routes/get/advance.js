const { getData } = require("../../functions/db");

const advance = async (req, resp) => {
  try {
    const { user } = req.params;

    const data = await getData(null, "advance", `user = ${user}`);

    resp.suc(data);
  } catch (err) {
    console.log("Error while fetching advance:", err);
    resp.fail();
  }
};

module.exports = advance;
