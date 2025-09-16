const fs = require("fs");
const path = require("path");

// Lấy danh sách các file Excel từ thư mục
const getExcelFiles = (req, res) => {
  const directoryPath = "D:/QuanLyThe/File excel"; // Đường dẫn cố định cho Excel

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: "Lỗi đọc thư mục", error: err });
    }

    // Chỉ lấy các file có đuôi .xlsx
    const excelFiles = files.filter((file) => file.endsWith(".xlsx"));

    res.json(excelFiles);
  });
};

// Tải file Excel theo tên
const getExcelFile = (req, res) => {
  const { fileName } = req.query;
  if (!fileName) {
    return res.status(400).json({ message: "Thiếu tên file" });
  }

  const filePath = path.join("D:/QuanLyThe/File excel", fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File không tồn tại" });
  }

  res.download(filePath, fileName, (err) => {
    if (err) {
      res.status(500).json({ message: "Lỗi khi tải file", error: err });
    }
  });
};

module.exports = { getExcelFiles, getExcelFile };
