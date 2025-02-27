const express = require ("express");
const cors = require ("cors");
const databaseRouter = require("./app/router/database.router");

const app = express ();

app.use (cors());
app.use (express.json());


app.use("/api/database", databaseRouter);

app.get("/", (req, res) => {
    res.json({ message: "Welcome to Quanlythe"});
});

module.exports = app;