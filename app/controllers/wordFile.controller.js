const fs = require("fs");
const path = require("path");

// Lấy danh sách các file Word từ thư mục
const getWordFiles = (req, res) => {
    const directoryPath = "D:/QuanLyThe/File word"; // Đường dẫn cố định

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ message: "Lỗi đọc thư mục", error: err });
        }

        // Chỉ lấy các file có đuôi .docx
        const wordFiles = files.filter(file => file.endsWith(".docx"));

        res.json(wordFiles);
    });
};

// Tải file Word theo tên
const getWordFile = (req, res) => {
    const { fileName } = req.query;
    if (!fileName) {
        return res.status(400).json({ message: "Thiếu tên file" });
    }

    const filePath = path.join("D:/QuanLyThe/File word", fileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File không tồn tại" });
    }

    res.download(filePath, fileName, (err) => {
        if (err) {
            res.status(500).json({ message: "Lỗi khi tải file", error: err });
        }
    });
};

module.exports = { getWordFiles, getWordFile };
