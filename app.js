const express = require ("express");
const cors = require ("cors");
const databaseRouter = require("./app/router/database.router");
const ApiError = require ("./app/api-error");
const Users = require("./app/router/users.route");
const Notifications = require ("./app/router/notification.route");



const app = express ();

app.use (cors());
app.use (express.json());
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Quanlythe"});
});


app.use("/api/database", databaseRouter);
app.use("/api/users", Users);
app.use("/api/notifications", Notifications);



app.use((req, res, next) => {
    return next(new ApiError(404, "Resource not found"));
});
app.use((err, req, res, next) => {
    return res.status(error.statusCode || 500).json({
        message: error.message || "Internal Server Error",
    });
});






module.exports = app;