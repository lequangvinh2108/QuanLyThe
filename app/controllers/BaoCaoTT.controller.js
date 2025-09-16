const BaoCaoTTService = require("../services/BaoCaoTT.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const ExcelJS = require("exceljs");

exports.generateBC = async (req, res, next) => {
  try {
    if (
      !req.files ||
      !req.files["file1008"] ||
      !req.files["file1108"] ||
      !req.files["file1008CN"] ||
      !req.files["file1108CN"]
    ) {
      return res.status(400).json({ message: "⚠️ Thiếu file upload" });
    }

    // Đọc file Excel như trước (dùng xlsx)
    const f1008 = xlsx.readFile(req.files["file1008"][0].path);
    const f1108 = xlsx.readFile(req.files["file1108"][0].path);
    const f1008CN = xlsx.readFile(req.files["file1008CN"][0].path);
    const f1108CN = xlsx.readFile(req.files["file1108CN"][0].path);

    const d1008 = xlsx.utils.sheet_to_json(f1008.Sheets[f1008.SheetNames[0]], {
      defval: 0,
    });
    const d1108 = xlsx.utils.sheet_to_json(f1108.Sheets[f1108.SheetNames[0]], {
      defval: 0,
    });
    const d1008CN = xlsx.utils.sheet_to_json(
      f1008CN.Sheets[f1008CN.SheetNames[0]],
      { defval: 0 }
    );
    const d1108CN = xlsx.utils.sheet_to_json(
      f1108CN.Sheets[f1108CN.SheetNames[0]],
      { defval: 0 }
    );

    const map1008 = Object.fromEntries(d1008.map((r) => [r.brcd, r]));
    const map1108 = Object.fromEntries(d1108.map((r) => [r.brcd, r]));
    const map1008CN = Object.fromEntries(d1008CN.map((r) => [r.brcd, r]));
    const map1108CN = Object.fromEntries(d1108CN.map((r) => [r.brcd, r]));

    const branches = Object.keys(map1008);
    let output = [];

    branches.forEach((br, idx) => {
      const r1008 = map1008[br] || {};
      const r1108 = map1108[br] || {};
      const r1008CN = map1008CN[br] || {};
      const r1108CN = map1108CN[br] || {};

      const duno_1008 = Number(r1008.tongduno) || 0;
      const duno_1108 = Number(r1108.tongduno) || 0;
      const duno_1008CN = Number(r1008CN.tongduno) || 0;

      const n2_1008 = Number(r1008.nhom2) || 0;
      const n2_1108 = Number(r1108.nhom2) || 0;
      const n2_1008CN = Number(r1008CN.nhom2) || 0;

      output.push({
        STT: idx + 1,
        CN: br,
        "Dư nợ 31/12": duno_1008,
        "Số liệu ngày trước": duno_1008CN,
        "Số liệu ngày mới": duno_1108,
        "Tăng/Giảm so 31/12": duno_1108 - duno_1008,
        "Tăng/Giảm so ngày trước": duno_1108 - duno_1008CN,

        "Nợ N2 31/12": n2_1008,
        "TL N2 31/12": duno_1008 ? n2_1008 / duno_1008 : 0,
        "Nợ N2 mới": n2_1108,
        "TL N2 mới": duno_1108 ? n2_1108 / duno_1108 : 0,
        "Tăng/Giảm N2 so 31/12": n2_1108 - n2_1008,
        "Nợ N2 ngày trước": n2_1008CN,
        "TL N2 ngày trước": duno_1008CN ? n2_1008CN / duno_1008CN : 0,
        "Nợ N2 mới (so CN)": n2_1108,
        "TL N2 mới (so CN)": duno_1108 ? n2_1108 / duno_1108 : 0,
        "Tăng/Giảm N2 so ngày trước": n2_1108 - n2_1008CN,
      });
    });

    // 📌 Xuất Excel bằng exceljs
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("BaoCaoTT");

    // Merge tiêu đề báo cáo
    sheet.mergeCells("A1:Q1");
    sheet.getCell("A1").value = "BÁO CÁO TÍN DỤNG";
    sheet.getCell("A1").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    sheet.getCell("A1").font = { size: 14, bold: true };

    // ====== HEADER 2 HÀNG ======
    // Hàng 2 (nhóm tiêu đề)
    sheet.mergeCells("A2:A3");
    sheet.mergeCells("B2:B3");
    sheet.mergeCells("C2:G2");
    sheet.mergeCells("H2:Q2");

    sheet.getCell("A2").value = "STT";
    sheet.getCell("B2").value = "Chi nhánh";
    sheet.getCell("C2").value = "Dư nợ";
    sheet.getCell("H2").value = "Nợ nhóm 2";

    // Hàng 3 (chi tiết cột con)
    sheet.getRow(3).values = [
      null,
      null, // bỏ trống A,B vì đã merge
      "31/12",
      "Số liệu ngày trước",
      "Số liệu ngày mới",
      "Tăng/Giảm so 31/12",
      "Tăng/Giảm so ngày trước",
      "31/12",
      "TL 31/12",
      "Mới",
      "TL mới",
      "Tăng/Giảm so 31/12",
      "Ngày trước",
      "TL ngày trước",
      "Mới (so CN)",
      "TL mới (so CN)",
      "Tăng/Giảm so ngày trước",
    ];

    // Style header
    [2, 3].forEach((r) => {
      sheet.getRow(r).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Auto width cột
    sheet.columns = [
      { key: "STT", width: 6 },
      { key: "CN", width: 15 },
      { key: "Dư nợ 31/12", width: 18 },
      { key: "Số liệu ngày trước", width: 20 },
      { key: "Số liệu ngày mới", width: 18 },
      { key: "Tăng/Giảm so 31/12", width: 20 },
      { key: "Tăng/Giảm so ngày trước", width: 22 },
      { key: "Nợ N2 31/12", width: 18 },
      { key: "TL N2 31/12", width: 15 },
      { key: "Nợ N2 mới", width: 18 },
      { key: "TL N2 mới", width: 15 },
      { key: "Tăng/Giảm N2 so 31/12", width: 22 },
      { key: "Nợ N2 ngày trước", width: 20 },
      { key: "TL N2 ngày trước", width: 18 },
      { key: "Nợ N2 mới (so CN)", width: 22 },
      { key: "TL N2 mới (so CN)", width: 22 },
      { key: "Tăng/Giảm N2 so ngày trước", width: 25 },
    ];

    // ====== Đổ dữ liệu từ hàng 4 trở đi ======
    output.forEach((row) => {
      sheet.addRow(Object.values(row));
    });

    // Style dữ liệu
    sheet.eachRow((row, idx) => {
      if (idx > 3) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          if (typeof cell.value === "number") {
            cell.numFmt = "#,##0"; // format số có dấu phẩy
          }
        });
      }
    });

    // Xuất file
    const filePath = path.join(__dirname, "../uploads", "BaoCaoTT-CN.xlsx");
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, "BaoCaoTT-CN.xlsx", (err) => {
      if (err) console.error("❌ Lỗi khi tải file:", err);
      fs.unlinkSync(filePath);
      Object.values(req.files)
        .flat()
        .forEach((f) => fs.unlinkSync(f.path));
    });
  } catch (err) {
    console.error("❌ generateBC error:", err);
    return res.status(500).json({ message: "Lỗi xử lý báo cáo" });
  }
};

// 👉 Import Excel
exports.importExcel = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, "Chưa upload file Excel"));
    }
    if (!req.body.NgayNhap) {
      return next(new ApiError(400, "Vui lòng nhập NgayNhap"));
    }

    // Đọc file Excel
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    // Tính toán
    const DNTT = rows.reduce((sum, r) => sum + (Number(r.tongduno) || 0), 0);
    const NN2TT = rows.reduce((sum, r) => sum + (Number(r.nhom2) || 0), 0);
    const NN1TT = rows.reduce((sum, r) => sum + (Number(r.nhom1) || 0), 0);
    const NXTT = DNTT - NN2TT - NN1TT;
    const TLNXTT = DNTT !== 0 ? NXTT / DNTT : 0;

    // 👉 Tạo mảng MaCN và tongdunoCN
    const MaCN = rows.map((r) => String(r.brcd).trim());
    const tongdunoCN = rows.map((r) => Number(r.tongduno) || 0);
    const nhom2CN = rows.map((r) => Number(r.nhom2) || 0);
    const nhom1CN = rows.map((r) => Number(r.nhom1) || 0);

    const record = {
      DNTT,
      NN2TT,
      NN1TT,
      NXTT,
      TLNXTT,
      NgayNhap: req.body.NgayNhap, // nhập tay
      MaCN, // 👉 Lưu thêm mảng MaCN
      tongdunoCN, // 👉 Lưu thêm mảng tongdunoCN
      nhom2CN,
      nhom1CN,
      rows, // 👉 Lưu toàn bộ dữ liệu chi tiết (để dùng cho compareTongDuNo)
    };

    const service = new BaoCaoTTService(MongoDB.client);
    await service.create(record);

    return res.send({
      message: "✅ Import Excel thành công",
      data: record,
    });
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Lỗi khi import Excel"));
  }
};

// 👉 CRUD mặc định
exports.create = async (req, res, next) => {
  if (!req.body?.DNTT || !req.body?.NgayNhap) {
    return next(new ApiError(400, "Thiếu dữ liệu báo cáo hoặc NgayNhap!"));
  }
  try {
    const service = new BaoCaoTTService(MongoDB.client);
    const document = await service.create(req.body);
    return res.send({ message: "✅ Thêm báo cáo thành công", id: document });
  } catch {
    return next(new ApiError(500, "Lỗi khi tạo báo cáo"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const service = new BaoCaoTTService(MongoDB.client);
    const documents = await service.findAll();
    return res.send(documents);
  } catch {
    return next(new ApiError(500, "Lỗi khi lấy danh sách báo cáo"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const service = new BaoCaoTTService(MongoDB.client);
    const document = await service.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy báo cáo"));
    }
    return res.send(document);
  } catch {
    return next(new ApiError(500, `Lỗi khi lấy báo cáo id=${req.params.id}`));
  }
};

exports.update = async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống!"));
  }
  try {
    const service = new BaoCaoTTService(MongoDB.client);
    const document = await service.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy báo cáo để cập nhật"));
    }
    return res.send({ message: "✅ Cập nhật báo cáo thành công" });
  } catch {
    return next(
      new ApiError(500, `Lỗi khi cập nhật báo cáo id=${req.params.id}`)
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const service = new BaoCaoTTService(MongoDB.client);
    const document = await service.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy báo cáo để xóa"));
    }
    return res.send({ message: "🗑️ Xóa báo cáo thành công" });
  } catch {
    return next(new ApiError(500, `Lỗi khi xóa báo cáo id=${req.params.id}`));
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const service = new BaoCaoTTService(MongoDB.client);
    const deletedCount = await service.deleteAll();
    return res.send({ message: `🗑️ Đã xóa ${deletedCount} báo cáo` });
  } catch {
    return next(new ApiError(500, "Lỗi khi xóa tất cả báo cáo"));
  }
};

exports.compareByDate = async (req, res, next) => {
  try {
    const { date1, date2 } = req.query;
    console.log("dates from query:", date1, date2); // <--- chắc chắn log ra
    const dates = [date1, date2];

    const service = new BaoCaoTTService(MongoDB.client);
    const records = await service.find({ NgayNhap: { $in: dates } });

    if (!records || records.length === 0) {
      return next(new ApiError(404, "Không tìm thấy báo cáo"));
    }
    return res.send(records);
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Lỗi khi so sánh dữ liệu theo ngày"));
  }
};

exports.compareChiNhanh = async (req, res, next) => {
  try {
    console.log("🚀 compareChiNhanh API được gọi");

    const { date1, date2 } = req.query;
    console.log("📌 Query dates:", date1, date2);
    // const { date1, date2 } = req.query;
    if (!date1 || !date2) {
      return next(new ApiError(400, "Thiếu tham số date1 hoặc date2"));
    }

    const service = new BaoCaoTTService(MongoDB.client);
    const allRecords = await service.find({});

    // 👉 Debug log ở đây
    console.log("📌 date1:", JSON.stringify(date1));
    console.log("📌 date2:", JSON.stringify(date2));
    console.log(
      "📌 DB NgayNhap:",
      allRecords.map((r) => JSON.stringify(r.NgayNhap))
    );

    const records = allRecords.filter((r) =>
      [date1, date2].includes(r.NgayNhap)
    );

    if (!records || records.length < 2) {
      return next(new ApiError(404, "Không tìm thấy báo cáo cho các ngày này"));
    }

    const dataByDate = {};
    records.forEach((r) => {
      dataByDate[r.NgayNhap] = {
        MaCN: r.MaCN || [],
        tongdunoCN: r.tongdunoCN || [],
      };
    });

    const cnList = [
      "7700",
      "7701",
      "7706",
      "7708",
      "7711",
      "7712",
      "7713",
      "7715",
      "7716",
    ];
    const MaCN1 = dataByDate[date1]?.MaCN || [];
    const MaCN2 = dataByDate[date2]?.MaCN || [];
    const td1 = dataByDate[date1]?.tongdunoCN || [];
    const td2 = dataByDate[date2]?.tongdunoCN || [];

    const map1 = Object.fromEntries(MaCN1.map((m, i) => [m, td1[i]]));
    const map2 = Object.fromEntries(MaCN2.map((m, i) => [m, td2[i]]));

    const result = cnList.map((brcd) => {
      const val1 = Number(map1[brcd] || 0);
      const val2 = Number(map2[brcd] || 0);
      const diff = val2 - val1;
      let trangthai = "Không có sự biến động";
      if (diff > 0) trangthai = "Tăng";
      if (diff < 0) trangthai = "Giảm";
      return {
        brcd,
        tongduno_date1: val1,
        tongduno_date2: val2,
        chenh_lech: diff,
        trangthai,
      };
    });

    return res.send(result);
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Lỗi khi so sánh tongduno chi nhánh"));
  }
};

// 👉 So sánh Nợ Nhóm 2 theo chi nhánh
exports.compareNoNhom2 = async (req, res, next) => {
  try {
    console.log("🚀 compareNoNhom2 API được gọi");

    const { date1, date2 } = req.query;
    if (!date1 || !date2) {
      return next(new ApiError(400, "Thiếu tham số date1 hoặc date2"));
    }

    const service = new BaoCaoTTService(MongoDB.client);
    const allRecords = await service.find({});
    const records = allRecords.filter((r) =>
      [date1, date2].includes(r.NgayNhap)
    );

    if (!records || records.length < 2) {
      return next(new ApiError(404, "Không tìm thấy báo cáo cho các ngày này"));
    }

    // Gom dữ liệu theo ngày
    const dataByDate = {};
    records.forEach((r) => {
      dataByDate[r.NgayNhap] = {
        MaCN: r.rows.map((row) => String(row.brcd).trim()),
        nhom2: r.rows.map((row) => Number(row.nhom2) || 0),
      };
    });

    const cnList = [
      "7700",
      "7701",
      "7706",
      "7708",
      "7711",
      "7712",
      "7713",
      "7715",
      "7716",
    ];

    const MaCN1 = dataByDate[date1]?.MaCN || [];
    const MaCN2 = dataByDate[date2]?.MaCN || [];
    const n2_1 = dataByDate[date1]?.nhom2 || [];
    const n2_2 = dataByDate[date2]?.nhom2 || [];

    const map1 = Object.fromEntries(MaCN1.map((m, i) => [m, n2_1[i]]));
    const map2 = Object.fromEntries(MaCN2.map((m, i) => [m, n2_2[i]]));

    const result = cnList.map((brcd) => {
      const val1 = Number(map1[brcd] || 0);
      const val2 = Number(map2[brcd] || 0);
      const diff = val2 - val1;
      let trangthai = "Không có sự biến động";
      if (diff > 0) trangthai = "Tăng";
      if (diff < 0) trangthai = "Giảm";
      return {
        brcd,
        nhom2_date1: val1,
        nhom2_date2: val2,
        chenh_lech: diff,
        trangthai,
      };
    });

    return res.send(result);
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Lỗi khi so sánh nợ nhóm 2"));
  }
};

// 👉 So sánh Nợ Xấu theo chi nhánh
exports.compareNoXau = async (req, res, next) => {
  try {
    console.log("🚀 compareNoXau API được gọi");

    const { date1, date2 } = req.query;
    if (!date1 || !date2) {
      return next(new ApiError(400, "Thiếu tham số date1 hoặc date2"));
    }

    const service = new BaoCaoTTService(MongoDB.client);
    const allRecords = await service.find({});
    const records = allRecords.filter((r) =>
      [date1, date2].includes(r.NgayNhap)
    );

    if (!records || records.length < 2) {
      return next(new ApiError(404, "Không tìm thấy báo cáo cho các ngày này"));
    }

    // Gom dữ liệu theo ngày
    const dataByDate = {};
    records.forEach((r) => {
      dataByDate[r.NgayNhap] = {
        MaCN: r.rows.map((row) => String(row.brcd).trim()),
        tongduno: r.rows.map((row) => Number(row.tongduno) || 0),
        nhom1: r.rows.map((row) => Number(row.nhom1) || 0),
        nhom2: r.rows.map((row) => Number(row.nhom2) || 0),
      };
    });

    const cnList = [
      "7700",
      "7701",
      "7706",
      "7708",
      "7711",
      "7712",
      "7713",
      "7715",
      "7716",
    ];

    const MaCN1 = dataByDate[date1]?.MaCN || [];
    const MaCN2 = dataByDate[date2]?.MaCN || [];
    const td1 = dataByDate[date1]?.tongduno || [];
    const td2 = dataByDate[date2]?.tongduno || [];
    const n1_1 = dataByDate[date1]?.nhom1 || [];
    const n1_2 = dataByDate[date2]?.nhom1 || [];
    const n2_1 = dataByDate[date1]?.nhom2 || [];
    const n2_2 = dataByDate[date2]?.nhom2 || [];

    const map1 = Object.fromEntries(
      MaCN1.map((m, i) => [m, td1[i] - n1_1[i] - n2_1[i]])
    );
    const map2 = Object.fromEntries(
      MaCN2.map((m, i) => [m, td2[i] - n1_2[i] - n2_2[i]])
    );

    const result = cnList.map((brcd) => {
      const val1 = Number(map1[brcd] || 0);
      const val2 = Number(map2[brcd] || 0);
      const diff = val2 - val1;
      let trangthai = "Không có sự biến động";
      if (diff > 0) trangthai = "Tăng";
      if (diff < 0) trangthai = "Giảm";
      return {
        brcd,
        noxau_date1: val1,
        noxau_date2: val2,
        chenh_lech: diff,
        trangthai,
      };
    });

    return res.send(result);
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "Lỗi khi so sánh nợ xấu"));
  }
};
