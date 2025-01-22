const fs = require("fs");
const uid = require("harsh-uid");
const { addData, getData } = require("../../functions/db");
const path = require("path");
const { authenticate } = require("../../functions/token");

const base64ToImage = (base64String, outputFilePath) => {
  const base64Data = base64String.replace(/^data:image\/jpeg;base64,/, "");
  fs.writeFile(outputFilePath, base64Data, "base64", (err) => {
    if (err) {
      console.error("Error while saving the image:", err);
    }
  });
};

const addAttendence = async (req, resp) => {
  try {
    const { body } = req;

    body.admin = await authenticate(req, resp);

    const today = new Date().toISOString().split("T")[0];

    const [{ singleMachineSalary, dubleMachineSalary }] = await getData(
      null,
      "employees",
      `_id = ${body.employee}`
    );

    body.salary = JSON.stringify({ singleMachineSalary, dubleMachineSalary });

    const userAttendances = await getData(
      null,
      "attendence",
      `employee = ${body.employee} && DATE(createdAt) = '${today}'`
    );

    if (userAttendances.length >= 2)
      return resp.fail("User already has two attendance records for today.");

    const machineAttendance = await getData(
      null,
      "attendence",
      `machine = ${body.machine} && DATE(createdAt) = '${today}'`
    );

    if (machineAttendance.length >= 1)
      return resp.fail("Machine already has one attendance record for today.");

    const imageName = `${uid(7)}.jpeg`;
    const photoPath = path.join(process.cwd(), "files", imageName);

    base64ToImage(body.photo, photoPath);

    body.photo = imageName;

    await addData(body, "attendence");

    resp.suc();
  } catch (err) {
    console.log("Error in addAttendence:", err);
    resp.fail();
  }
};

module.exports = addAttendence;
