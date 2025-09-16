const express = require("express");
const BaoCaoTT = require("../controllers/BaoCaoTT.controller");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });
// const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get("/compare", BaoCaoTT.compareByDate);
router.get("/compare-chinhanh", BaoCaoTT.compareChiNhanh);
router.get("/compare-nhom2", BaoCaoTT.compareNoNhom2);
router.get("/compare-noxau", BaoCaoTT.compareNoXau);
router.post(
  "/generateBC",
  upload.fields([
    { name: "file1008" },
    { name: "file1108" },
    { name: "file1008CN" },
    { name: "file1108CN" },
  ]),
  BaoCaoTT.generateBC
);

router
  .route("/")
  .get(BaoCaoTT.findAll)
  .post(BaoCaoTT.create)
  .delete(BaoCaoTT.deleteAll);

router
  .route("/:id")
  .get(BaoCaoTT.findOne)
  .put(BaoCaoTT.update)
  .delete(BaoCaoTT.delete);

// 👉 API import Excel
router.post("/import/excel", upload.single("file"), BaoCaoTT.importExcel);
// router.get("/compare-chinhanh", BaoCaoTT.compareChiNhanh);

module.exports = router;
