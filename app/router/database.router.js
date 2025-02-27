const express = require("express");
const databse = require("../controllers/database.controller");

const router = express.Router();

router.route("/")
    .get(DatabaseSync.findAll)
    .post(DatabaseSync.create)

module.exports = router;