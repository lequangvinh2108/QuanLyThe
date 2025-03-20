const express = require ("express");
const cors = require ("cors");
const databaseRouter = require("./app/router/database.router");
const ApiError = require ("./app/api-error");
const Users = require("./app/router/users.route");
const Notifications = require ("./app/router/notification.route");
const wordFileRoutes = require("./app/router/wordFile.route");
const path = require("path"); // Thêm thư viện path

const app = express ();

app.use (cors());
app.use (express.json());
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Quanlythe"});
});

// ✅ Serve favicon từ thư mục public
app.use("/favicon.ico", express.static(path.join(__dirname, "public", "favicon.ico")));


app.use("/api/database", databaseRouter);
app.use("/api/users", Users);
app.use("/api/notifications", Notifications);
app.use("/api", wordFileRoutes);


app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});

app.use((err, req, res, next) => {
    return res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
    });
});



module.exports = app;