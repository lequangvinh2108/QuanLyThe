const express = require("express");
const router = express.Router();
const XFBC = require("../controllers/XFBC.controller");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post("/generateBC", XFBC.generateBC);

router.post("/import", upload.single("file"), XFBC.importExcel);
router.get("/", XFBC.findAll);
router.delete("/", XFBC.deleteAll);

module.exports = router;
