const express = require("express");
const router = express.Router();
const {
  getExcelFiles,
  getExcelFile,
} = require("../controllers/excelfile.controller");

// Lấy danh sách file Excel
router.get("/excel-files", getExcelFiles);

// Tải file Excel
router.get("/download-excel", getExcelFile);

module.exports = router;
