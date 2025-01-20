const { default: axios } = require("axios");
const { getData } = require("../../functions/db");
const { generateToken } = require("../../functions/token");
const { otpMap } = require("../../functions/map");

const adminLogin = async (req, resp) => {
  try {
    const { mobNo, otp } = req.body;

    const [admin] = await getData("_id", "admins", `mobNo = '${mobNo}'`);

    if (!admin) return resp.fail("Admin not found");

    if (!otp) {
      const apiKey =
        "y7Rm8QHK9CbkDsFPdrlfNjVvA4gOUzq6iT2pu0aIWohMcJB3GZrRB5fvz1eZqWG0Ynwkoiy4XDS9QdF3";

      const otp = Math.floor(1000 + Math.random() * 9000);
      console.log("🚀 ~ file: adminLogin.js:19 ~ adminLogin ~ otp:", otp);

      const {
        data: { return: status, message },
      } = await axios.get(
        `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=otp&variables_values=${otp}&flash=0&numbers=${mobNo}`
      );

      if (!status) return resp.fail(message);

      otpMap.set(mobNo, otp);

      setTimeout(() => {
        otpMap.delete(mobNo);
      }, 5 * 60 * 1000);

      return resp.suc();
    } else {
      if (otpMap.get(mobNo) == otp) {
        otpMap.delete(mobNo);

        const token = generateToken(admin);

        return resp.suc({ token, _id: admin._id });
      } else {
        return resp.fail("Invalid OTP");
      }
    }
  } catch (err) {
    console.log("��� ~ file: adminLogin.js:5 ~ adminLogin ~ err:", err);
    resp.fail();
  }
};

module.exports = adminLogin;
