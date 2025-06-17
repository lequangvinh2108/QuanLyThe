const express = require("express");
const users = require("../controllers/users.controller");

const router = express.Router();

router
  .route("/")
  .get(users.findAll) // Lấy tất cả người dùng
  .post(users.create) // Thêm người dùng mới
  .delete(users.deleteAll); // Xóa tất cả người dùng

router
  .route("/:id")
  // .get(users.findOne)   // Lấy người dùng theo ID
  .put(users.update) // Cập nhật người dùng theo ID
  .delete(users.delete); // Xóa người dùng theo ID

// 🔥 Route đăng nhập 🔥
router.route("/login").post(users.login); // Kiểm tra đăng nhập

router.get("/getall", users.getAll);
router.get("/getuser/:user", users.getUser);
router.put("/updateuser/:user", users.updateUser);
router.get("/getbyid/:id", users.getById);

router.put("/updateauthority/:name", users.updateAuthority);
router.put("/updatepassword/:id", users.updatePassword);
router.post("/createmany", users.createMany);

module.exports = router;
