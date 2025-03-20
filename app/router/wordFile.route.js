const express = require("express");
const router = express.Router();
const { getWordFiles, getWordFile } = require("../controllers/wordFile.controller");

// Lấy danh sách file Word
router.get("/word-files", getWordFiles);

// Tải file Word
router.get("/download-word", getWordFile);

module.exports = router;
