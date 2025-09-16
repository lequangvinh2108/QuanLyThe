const express = require("express");
const cors = require("cors");
const databaseRouter = require("./app/router/database.router");
const ApiError = require("./app/api-error");
const Users = require("./app/router/users.route");
const Notifications = require("./app/router/notification.route");
const wordFileRoutes = require("./app/router/wordFile.route");
const leaveofabsence = require("./app/router/leaveofabsence.route");
const excelFileRoutes = require("./app/router/excelfile.route");
// const HTQLN_N2Router = require("./app/router/HTQLN_N2.route");
// const HTQLNRouter = require("./app/router/HTQLN.route");

const path = require("path"); // Thêm thư viện path

const app = express();
app.use((req, res, next) => {
  console.log("👉 Request:", req.method, req.originalUrl);
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Quanlythe" });
});

// ✅ Serve favicon từ thư mục public
app.use(
  "/favicon.ico",
  express.static(path.join(__dirname, "public", "favicon.ico"))
);

app.use("/api/database", databaseRouter);
app.use("/api/users", Users);
app.use("/api/notifications", Notifications);
app.use("/api", wordFileRoutes);
app.use("/api/leaveofabsence", leaveofabsence);
app.use("/api", excelFileRoutes);

// Cho phép client truy cập file đã upload
app.use("/uploads", express.static("uploads"));

// Import route
const HTQLNRoute = require("./app/router/HTQLN.route");
app.use("/api/HTQLN", HTQLNRoute);

const BaoCaoTTRouter = require("./app/router/BaoCaoTT.route");
app.use("/api/BaoCaoTT", BaoCaoTTRouter);

const XFBCRoute = require("./app/router/XFBC.route");
app.use("/api/XFBC", XFBCRoute);

app.use((req, res, next) => {
  return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
  return res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
