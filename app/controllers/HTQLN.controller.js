const ApiError = require("../api-error");
const HTQLNService = require("../services/HTQLN.service");
const MongoDB = require("../utils/mongodb.util");
const XLSX = require("xlsx");

exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ApiError(400, "Không có file được upload"));
    }

    const { uploadDate, loaiNo } = req.body;
    if (!uploadDate || !loaiNo) {
      return next(new ApiError(400, "Thiếu thông tin ngày nhập hoặc loại nợ"));
    }

    // Đọc file Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let MaCN = [];
    let TenCN = []; // ✅ thêm mảng Tên chi nhánh
    let MaKH = [];
    let HoTenKH = [];
    let Tongduno = 0;
    let DuNo = [];

    rows.forEach((row) => {
      const maCN = row["Mã chi nhánh"]
        ? row["Mã chi nhánh"].toString().trim()
        : "";
      const tenCN = row["Tên chi nhánh"]
        ? row["Tên chi nhánh"].toString().trim()
        : ""; // ✅ lấy từ cột Tên chi nhánh
      const maKH = row["Mã khách hàng"]
        ? row["Mã khách hàng"].toString().trim()
        : "";
      const tenKH = row["Tên khách hàng"]
        ? row["Tên khách hàng"].toString().trim()
        : "";
      const duNo = row["Dư nợ"] ? row["Dư nợ"].toString().trim() : "";

      // ❌ Bỏ qua dòng rỗng
      if (maCN && tenCN && maKH && tenKH) {
        MaCN.push(maCN);
        TenCN.push(tenCN); // ✅ push thêm tên chi nhánh
        MaKH.push(maKH);
        HoTenKH.push(tenKH);
        DuNo.push(duNo);
      }

      // Lấy giá trị dư nợ cuối cùng
      if (row["Dư nợ"] !== undefined && !isNaN(row["Dư nợ"])) {
        Tongduno = row["Dư nợ"];
      }
    });

    const service = new HTQLNService(MongoDB.client);
    await service.create({
      MaCN,
      TenCN, // ✅ lưu thêm field TenCN
      MaKH,
      HoTenKH,
      Tongduno,
      LoaiNo: loaiNo,
      NgayNhap: uploadDate,
      DuNo,
    });

    return res.send({
      message: "Upload & lưu dữ liệu thành công",
      count: MaCN.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return next(new ApiError(500, "Có lỗi khi upload file"));
  }
};

exports.create = async (req, res, next) => {
  if (!req.body.HoTenKH) {
    return next(new ApiError(400, "Tên khách hàng không được để trống"));
  }
  try {
    const service = new HTQLNService(MongoDB.client);
    const document = await service.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi khi tạo bản ghi"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const service = new HTQLNService(MongoDB.client);
    const documents = await service.findAll();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "Có lỗi khi lấy danh sách bản ghi"));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const service = new HTQLNService(MongoDB.client);
    const document = await service.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy bản ghi"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi lấy bản ghi id=${req.params.id}`));
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }
  try {
    const service = new HTQLNService(MongoDB.client);
    const document = await service.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy bản ghi"));
    }
    await service.update(req.params.id, req.body);
    return res.send({ message: "Cập nhật bản ghi thành công" });
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi cập nhật bản ghi id=${req.params.id}`)
    );
  }
};

exports.compareByDate = async (req, res, next) => {
  console.log("🎯 compareByDate route HIT");
  console.log("Query params received:", req.query);

  try {
    const { date1, date2 } = req.query;

    if (!date1 || !date2) {
      console.log("❌ Thiếu date1 hoặc date2");
      return next(new ApiError(400, "Thiếu tham số date1 hoặc date2"));
    }

    const service = new HTQLNService(MongoDB.client);

    console.log("🔍 Querying database with dates:", date1.trim(), date2.trim());

    // Lấy dữ liệu Nợ Nhóm 2 cho 2 ngày
    const data = await service.find({
      LoaiNo: "Nợ Nhóm 2",
      NgayNhap: { $in: [date1.trim(), date2.trim()] },
    });

    console.log("Database returned records:", data.length, "entries");

    if (!data || data.length < 1) {
      console.log("❌ Không tìm thấy dữ liệu nào");
      return next(new ApiError(404, "Không tìm thấy dữ liệu Nợ Nhóm 2"));
    }

    // Tách dữ liệu theo ngày
    const data1 = data.find((d) => d.NgayNhap.trim() === date1.trim());
    const data2 = data.find((d) => d.NgayNhap.trim() === date2.trim());

    // Nếu 1 trong 2 ngày không có dữ liệu, tạo object trống
    const emptyData = { MaCN: [], TenCN: [], MaKH: [], HoTenKH: [], DuNo: [] };
    const day1 = data1 || emptyData;
    const day2 = data2 || emptyData;

    // Hàm compareDuNo với TenCN
    function compareDuNo(data1, data2) {
      const map1 = new Map();
      const map2 = new Map();

      data1.MaKH.forEach((MaKH, idx) => map1.set(MaKH, idx));
      data2.MaKH.forEach((MaKH, idx) => map2.set(MaKH, idx));

      const allKeys = new Set([...map1.keys(), ...map2.keys()]);
      const result = [];

      allKeys.forEach((MaKH) => {
        const idx1 = map1.get(MaKH);
        const idx2 = map2.get(MaKH);

        if (idx1 === undefined && idx2 !== undefined) {
          result.push({
            MaKH,
            HoTenKH: data2.HoTenKH[idx2],
            TrangThai: "Xuất hiện mới",
            MaCN: data2.MaCN[idx2],
            TenCN: data2.TenCN[idx2],
            DuNoDiff: data2.DuNo[idx2],
          });
        } else if (idx1 !== undefined && idx2 === undefined) {
          result.push({
            MaKH,
            HoTenKH: data1.HoTenKH[idx1],
            TrangThai: "Không còn nợ nhóm 2",
            MaCN: data1.MaCN[idx1],
            TenCN: data1.TenCN[idx1],
            DuNoDiff: -data1.DuNo[idx1],
          });
        } else if (idx1 !== undefined && idx2 !== undefined) {
          const diff = data2.DuNo[idx2] - data1.DuNo[idx1];
          if (diff > 0) {
            result.push({
              MaKH,
              HoTenKH: data2.HoTenKH[idx2],
              TrangThai: "Tăng nợ nhóm 2",
              MaCN: data2.MaCN[idx2],
              TenCN: data2.TenCN[idx2],
              DuNoDiff: diff,
            });
          } else if (diff < 0) {
            result.push({
              MaKH,
              HoTenKH: data2.HoTenKH[idx2],
              TrangThai: "Giảm nợ nhóm 2",
              MaCN: data2.MaCN[idx2],
              TenCN: data2.TenCN[idx2],
              DuNoDiff: diff,
            });
          }
          // diff = 0 bỏ qua
        }
      });

      return result;
    }

    // So sánh dư nợ
    const result = compareDuNo(day1, day2);

    // Sắp xếp theo MaCN → MaKH
    const resultSorted = result.sort((a, b) => {
      if (a.MaCN < b.MaCN) return -1;
      if (a.MaCN > b.MaCN) return 1;
      if (a.MaKH < b.MaKH) return -1;
      if (a.MaKH > b.MaKH) return 1;
      return 0;
    });

    console.log(
      "✅ CompareByDate completed, returning sorted result:",
      resultSorted.length,
      "entries"
    );
    return res.send(resultSorted);
  } catch (error) {
    console.error("💥 Error in compareByDate:", error);
    return next(new ApiError(500, "Có lỗi khi so sánh dữ liệu 2 ngày"));
  }
};

exports.compareNXByDate = async (req, res, next) => {
  console.log("🎯 compareNXByDate route HIT");
  console.log("Query params received:", req.query);

  try {
    const { date1, date2 } = req.query;

    if (!date1 || !date2) {
      console.log("❌ Thiếu date1 hoặc date2");
      return next(new ApiError(400, "Thiếu tham số date1 hoặc date2"));
    }

    const service = new HTQLNService(MongoDB.client);

    console.log(
      "🔍 Querying database with dates (Nợ Xấu):",
      date1.trim(),
      date2.trim()
    );

    // Lấy dữ liệu Nợ Xấu cho 2 ngày
    const data = await service.find({
      LoaiNo: "Nợ Xấu",
      NgayNhap: { $in: [date1.trim(), date2.trim()] },
    });

    console.log("Database returned records:", data.length, "entries");

    if (!data || data.length < 1) {
      console.log("❌ Không tìm thấy dữ liệu nào");
      return next(new ApiError(404, "Không tìm thấy dữ liệu Nợ Xấu"));
    }

    // Tách dữ liệu theo ngày
    const data1 = data.find((d) => d.NgayNhap.trim() === date1.trim());
    const data2 = data.find((d) => d.NgayNhap.trim() === date2.trim());

    // Nếu 1 trong 2 ngày không có dữ liệu, tạo object trống
    const emptyData = { MaCN: [], TenCN: [], MaKH: [], HoTenKH: [], DuNo: [] };
    const day1 = data1 || emptyData;
    const day2 = data2 || emptyData;

    // Hàm so sánh dư nợ
    function compareDuNo(data1, data2) {
      const map1 = new Map();
      const map2 = new Map();

      data1.MaKH.forEach((MaKH, idx) => map1.set(MaKH, idx));
      data2.MaKH.forEach((MaKH, idx) => map2.set(MaKH, idx));

      const allKeys = new Set([...map1.keys(), ...map2.keys()]);
      const result = [];

      allKeys.forEach((MaKH) => {
        const idx1 = map1.get(MaKH);
        const idx2 = map2.get(MaKH);

        if (idx1 === undefined && idx2 !== undefined) {
          result.push({
            MaKH,
            HoTenKH: data2.HoTenKH[idx2],
            TrangThai: "Xuất hiện mới",
            MaCN: data2.MaCN[idx2],
            TenCN: data2.TenCN[idx2],
            DuNoDiff: data2.DuNo[idx2],
          });
        } else if (idx1 !== undefined && idx2 === undefined) {
          result.push({
            MaKH,
            HoTenKH: data1.HoTenKH[idx1],
            TrangThai: "Không còn nợ xấu",
            MaCN: data1.MaCN[idx1],
            TenCN: data1.TenCN[idx1],
            DuNoDiff: -data1.DuNo[idx1],
          });
        } else if (idx1 !== undefined && idx2 !== undefined) {
          const diff = data2.DuNo[idx2] - data1.DuNo[idx1];
          if (diff > 0) {
            result.push({
              MaKH,
              HoTenKH: data2.HoTenKH[idx2],
              TrangThai: "Tăng nợ xấu",
              MaCN: data2.MaCN[idx2],
              TenCN: data2.TenCN[idx2],
              DuNoDiff: diff,
            });
          } else if (diff < 0) {
            result.push({
              MaKH,
              HoTenKH: data2.HoTenKH[idx2],
              TrangThai: "Giảm nợ xấu",
              MaCN: data2.MaCN[idx2],
              TenCN: data2.TenCN[idx2],
              DuNoDiff: diff,
            });
          }
          // diff = 0 => bỏ qua
        }
      });

      return result;
    }

    // So sánh dư nợ
    const result = compareDuNo(day1, day2);

    // Sắp xếp theo MaCN → MaKH
    const resultSorted = result.sort((a, b) => {
      if (a.MaCN < b.MaCN) return -1;
      if (a.MaCN > b.MaCN) return 1;
      if (a.MaKH < b.MaKH) return -1;
      if (a.MaKH > b.MaKH) return 1;
      return 0;
    });

    console.log(
      "✅ compareNXByDate completed, returning sorted result:",
      resultSorted.length,
      "entries"
    );
    return res.send(resultSorted);
  } catch (error) {
    console.error("💥 Error in compareNXByDate:", error);
    return next(
      new ApiError(500, "Có lỗi khi so sánh dữ liệu 2 ngày (Nợ Xấu)")
    );
  }
};
