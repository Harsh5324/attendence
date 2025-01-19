const { port } = require("./configs");
const { app, router, express } = require("./functions/router");
const advance = require("./routes/get/advance");
const attendance = require("./routes/get/attendance");
const employees = require("./routes/get/employees");
const machineHistory = require("./routes/get/machineHistory");
const machines = require("./routes/get/machines");
const qr = require("./routes/get/qr");
const userDetails = require("./routes/get/userDetails");
const addAdvance = require("./routes/post/addAdvance");
const addAttendence = require("./routes/post/addAttendence");
const addEmployee = require("./routes/post/addEmployee");
const addMachine = require("./routes/post/addMachine");
const adminLogin = require("./routes/post/adminLogin");

app.use("/media", express.static("./files"));

app.listen(port);

router.get("/machines", machines);
router.get("/employees", employees);
router.get("/attendance", attendance);
router.get("/qr", qr);
router.get("/machine-history", machineHistory);
router.get("/user-details/:id", userDetails);
router.get("/advance/:user", advance);

router.post("/add-machine", addMachine);
router.post("/admin-login", adminLogin);
router.post("/add-employee", addEmployee);
router.post("/add-attendance", addAttendence);
router.post("/add-advance", addAdvance);
