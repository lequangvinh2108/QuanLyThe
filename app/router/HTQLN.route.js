const express = require("express");
const HTQLN = require("../controllers/HTQLN.controller");
const multer = require("multer");
const path = require("path");

const router = express.Router();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file Excel (.xlsx)!"), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post("/upload", upload.single("file"), HTQLN.uploadFile);

// router.route("/").get(HTQLN.findAll).post(HTQLN.create).delete(HTQLN.deleteAll);

// router.route("/:id").get(HTQLN.findOne).put(HTQLN.update).delete(HTQLN.delete);
router.get("/compare", HTQLN.compareByDate);

// router.get("/compare-nx", HTQLN.compareNXByDate);
router.get("/compareNX", HTQLN.compareNXByDate);

module.exports = router;
