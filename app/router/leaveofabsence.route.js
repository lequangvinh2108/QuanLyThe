const express = require("express");
const leaveController = require("../controllers/leaveofabsence.controller");

const router = express.Router();

router
  .route("/")
  .get(leaveController.findAll)
  .post(leaveController.create)
  .delete(leaveController.deleteAll);

router
  .route("/:id")
  .get(leaveController.findOne)
  .put(leaveController.update)
  .delete(leaveController.delete);

router.get("/getall", leaveController.getAll);
router.get("/getbyid/:id", leaveController.getById);

module.exports = router;
