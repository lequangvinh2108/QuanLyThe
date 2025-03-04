const express = require("express");
const database = require("../controllers/database.controller");

const router = express.Router();

router.route("/")
    .get(database.findAll)  // Lấy tất cả bản ghi
    .post(database.create)  // Tạo mới bản ghi
    .delete(database.deleteAll); // Xóa tất cả bản ghi

router.route("/:id")
    .get(database.findOne)   // Lấy một bản ghi theo ID
    .put(database.update)    // Cập nhật bản ghi theo ID
    .delete(database.delete); // Xóa bản ghi theo ID

module.exports = router;
