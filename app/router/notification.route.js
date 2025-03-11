// notifications.route.js
const express = require("express");
const notifications = require("../controllers/notification.controller");
const router = express.Router();

router.route("/")
    .get(notifications.getAll)  // Lấy tất cả thông báo
    .post(notifications.create)  // Thêm thông báo mới
    .delete(notifications.deleteAll); // Xóa tất cả thông báo

router.route("/:id")
    .get(notifications.getById)  // Lấy thông báo theo ID
    .put(notifications.update)   // Cập nhật thông báo theo ID
    .delete(notifications.delete); // Xóa thông báo theo ID

module.exports = router;