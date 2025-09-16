const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const xlsx = require("xlsx");

class XFBCService {
  constructor(client) {
    this.collection = client.db().collection("XFBC");
  }

  // Import Excel
  async importExcel(file, body) {
    if (!file) {
      throw new ApiError(400, "Chưa upload file Excel");
    }

    const workbook = xlsx.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      defval: 0,
    });

    let record = {
      Loai: body.Loai, // "CN" hoặc "TT"
      NgayNhap: body.NgayNhap,
    };

    if (body.Loai === "CN") {
      record["CN-MaNV"] = sheetData.map((r) => r.empno?.toString() || "");
      record["CN-TenNV"] = sheetData.map((r) => r.empnm?.toString() || "");
      record["CN-Tongduno"] = sheetData.map((r) => Number(r.tongduno) || 0);
      record["CN-Nonhom1"] = sheetData.map((r) => Number(r.nhom1) || 0);
      record["CN-Nonhom2"] = sheetData.map((r) => Number(r.nhom2) || 0);
    }

    if (body.Loai === "TT") {
      record["TT-MaCN"] = sheetData.map((r) => r.brcd?.toString() || "");
      record["TT-TenCN"] = sheetData.map((r) => r.brnm?.toString() || "");
      record["TT-Tongduno"] = sheetData.map((r) => Number(r.tongduno) || 0);
      record["TT-Nhom1"] = sheetData.map((r) => Number(r.nhom1) || 0);
      record["TT-Nhom2"] = sheetData.map((r) => Number(r.nhom2) || 0);
      record["TT-Nhom3"] = sheetData.map((r) => Number(r.nhom3) || 0);
    }

    const result = await this.collection.insertOne(record);
    return result;
  }

  async findAll() {
    return await this.collection.find({}).toArray();
  }

  async deleteAll() {
    const result = await this.collection.deleteMany({});
    return result.deletedCount;
  }

  // Tính toán báo cáo
  async generateBC(ngaytruoc, ngaysau) {
    // Lấy dữ liệu TT và CN của ngày trước
    const ttBefore = await this.collection.findOne({
      Loai: "TT",
      NgayNhap: ngaytruoc,
    });
    const cnBefore = await this.collection.findOne({
      Loai: "CN",
      NgayNhap: ngaytruoc,
    });

    // Lấy dữ liệu TT và CN của ngày sau
    const ttAfter = await this.collection.findOne({
      Loai: "TT",
      NgayNhap: ngaysau,
    });
    const cnAfter = await this.collection.findOne({
      Loai: "CN",
      NgayNhap: ngaysau,
    });

    if (!ttBefore || !ttAfter || !cnBefore || !cnAfter) {
      throw new ApiError(404, "Không đủ dữ liệu để tính toán");
    }

    // Helper: tìm giá trị theo mã CN trong bản ghi TT
    const getTT = (doc, maCN) => {
      const idx = doc["TT-MaCN"].findIndex((m) => m === maCN.toString());
      return idx >= 0 ? doc["TT-Tongduno"][idx] : 0;
    };

    const getTTNhom2 = (doc, maCN) => {
      const idx = doc["TT-MaCN"].findIndex((m) => m === maCN.toString());
      return idx >= 0 ? doc["TT-Nhom2"][idx] : 0;
    };

    const getTT_Excluding = (doc, maCN) => {
      const idx = doc["TT-MaCN"].findIndex((m) => m === maCN.toString());
      if (idx < 0) return 0;
      return (
        (doc["TT-Tongduno"][idx] || 0) -
        (doc["TT-Nhom1"][idx] || 0) -
        (doc["TT-Nhom2"][idx] || 0)
      );
    };

    // Helper: tìm giá trị theo tên NV trong bản ghi CN
    const getCN = (doc, listTen) => {
      return doc["CN-TenNV"].reduce((sum, ten, i) => {
        if (listTen.includes(ten)) {
          sum += doc["CN-Tongduno"][i] || 0;
        }
        return sum;
      }, 0);
    };

    const getCNNhom2 = (doc, listTen) => {
      return doc["CN-TenNV"].reduce((sum, ten, i) => {
        if (listTen.includes(ten)) {
          sum += doc["CN-Nonhom2"][i] || 0;
        }
        return sum;
      }, 0);
    };

    const getCN_Excluding = (doc, listTen) => {
      return doc["CN-TenNV"].reduce((sum, ten, i) => {
        if (listTen.includes(ten)) {
          sum +=
            (doc["CN-Tongduno"][i] || 0) -
            (doc["CN-Nonhom1"][i] || 0) -
            (doc["CN-Nonhom2"][i] || 0);
        }
        return sum;
      }, 0);
    };

    // Danh sách nhóm nhân viên cần cộng
    const nhomNV_ThuHa = [
      "Lê Thu Hà",
      "Nguyễn Thị Mai Anh",
      "Đinh Thị Huyền Trang",
      "Dương Thành Thái",
      "Bùi Tuấn Huy",
      "Trần Xuân Đào",
    ];
    const nhomNV_QuocViet = ["Hà Quốc Việt", "Nguyễn Thị B.Nguyệt"];

    // Tính toán các ô
    const result = {
      D13: getTT(ttBefore, "7700"),
      D14: getCN(cnBefore, nhomNV_ThuHa),
      D15: getCN(cnBefore, nhomNV_QuocViet),
      D16: getTT(ttBefore, "7701"),
      D17: getTT(ttBefore, "7706"),
      D18: getTT(ttBefore, "7708"),
      D19: getTT(ttBefore, "7711"),
      D20: getTT(ttBefore, "7712"),
      D21: getTT(ttBefore, "7713"),
      D22: getTT(ttBefore, "7715"),
      D23: getTT(ttBefore, "7716"),

      E13: getTT(ttAfter, "7700"),
      E14: getCN(cnAfter, nhomNV_ThuHa),
      E15: getCN(cnAfter, nhomNV_QuocViet),
      E16: getTT(ttAfter, "7701"),
      E17: getTT(ttAfter, "7706"),
      E18: getTT(ttAfter, "7708"),
      E19: getTT(ttAfter, "7711"),
      E20: getTT(ttAfter, "7712"),
      E21: getTT(ttAfter, "7713"),
      E22: getTT(ttAfter, "7715"),
      E23: getTT(ttAfter, "7716"),

      J13: getTTNhom2(ttAfter, "7700"),
      J14: getCNNhom2(cnAfter, nhomNV_ThuHa),
      J15: getCNNhom2(cnAfter, nhomNV_QuocViet),
      J16: getTTNhom2(ttAfter, "7701"),
      J17: getTTNhom2(ttAfter, "7706"),
      J18: getTTNhom2(ttAfter, "7708"),
      J19: getTTNhom2(ttAfter, "7711"),
      J20: getTTNhom2(ttAfter, "7712"),
      J21: getTTNhom2(ttAfter, "7713"),
      J22: getTTNhom2(ttAfter, "7715"),
      J23: getTTNhom2(ttAfter, "7716"),

      M13: getTTNhom2(ttBefore, "7700"),
      M14: getCNNhom2(cnBefore, nhomNV_ThuHa),
      M15: getCNNhom2(cnBefore, nhomNV_QuocViet),
      M16: getTTNhom2(ttBefore, "7701"),
      M17: getTTNhom2(ttBefore, "7706"),
      M18: getTTNhom2(ttBefore, "7708"),
      M19: getTTNhom2(ttBefore, "7711"),
      M20: getTTNhom2(ttBefore, "7712"),
      M21: getTTNhom2(ttBefore, "7713"),
      M22: getTTNhom2(ttBefore, "7715"),
      M23: getTTNhom2(ttBefore, "7716"),

      D33: getTT(ttBefore, "7700"),
      D34: getCN(cnBefore, nhomNV_ThuHa),
      D35: getCN(cnBefore, nhomNV_QuocViet),
      D36: getTT(ttBefore, "7701"),
      D37: getTT(ttBefore, "7706"),
      D38: getTT(ttBefore, "7708"),
      D39: getTT(ttBefore, "7711"),
      D40: getTT(ttBefore, "7712"),
      D41: getTT(ttBefore, "7713"),
      D42: getTT(ttBefore, "7715"),
      D43: getTT(ttBefore, "7716"),

      E33: getTT(ttAfter, "7700"),
      E34: getCN(cnAfter, nhomNV_ThuHa),
      E35: getCN(cnAfter, nhomNV_QuocViet),
      E36: getTT(ttAfter, "7701"),
      E37: getTT(ttAfter, "7706"),
      E38: getTT(ttAfter, "7708"),
      E39: getTT(ttAfter, "7711"),
      E40: getTT(ttAfter, "7712"),
      E41: getTT(ttAfter, "7713"),
      E42: getTT(ttAfter, "7715"),
      E43: getTT(ttAfter, "7716"),

      J33: getTT_Excluding(ttAfter, "7700"),
      J34: getCN_Excluding(cnAfter, nhomNV_ThuHa),
      J35: getCN_Excluding(cnAfter, nhomNV_QuocViet),
      J36: getTT_Excluding(ttAfter, "7701"),
      J37: getTT_Excluding(ttAfter, "7706"),
      J38: getTT_Excluding(ttAfter, "7708"),
      J39: getTT_Excluding(ttAfter, "7711"),
      J40: getTT_Excluding(ttAfter, "7712"),
      J41: getTT_Excluding(ttAfter, "7713"),
      J42: getTT_Excluding(ttAfter, "7715"),
      J43: getTT_Excluding(ttAfter, "7716"),

      M33: getTT_Excluding(ttBefore, "7700"),
      M34: getCN_Excluding(cnBefore, nhomNV_ThuHa),
      M35: getCN_Excluding(cnBefore, nhomNV_QuocViet),
      M36: getTT_Excluding(ttBefore, "7701"),
      M37: getTT_Excluding(ttBefore, "7706"),
      M38: getTT_Excluding(ttBefore, "7708"),
      M39: getTT_Excluding(ttBefore, "7711"),
      M40: getTT_Excluding(ttBefore, "7712"),
      M41: getTT_Excluding(ttBefore, "7713"),
      M42: getTT_Excluding(ttBefore, "7715"),
      M43: getTT_Excluding(ttBefore, "7716"),
    };

    // Helper: lấy năm từ chuỗi yyyy-mm-dd
    const getYear = (dateStr) => {
      try {
        return new Date(dateStr).getFullYear();
      } catch {
        return null;
      }
    };

    const year = getYear(ngaytruoc) || getYear(ngaysau);

    // Cấu hình C13-C23 theo năm
    const C_values_by_year = {
      2025: {
        C13: 2819707.34,
        C14: 2307009.34,
        C15: 512698,
        C16: 888828,
        C17: 1726583,
        C18: 748955,
        C19: 1643004,
        C20: 1301903,
        C21: 2160442,
        C22: 1919733,
        C23: 1593433,
      },
      2026: {
        // TODO: thay số liệu năm 2026 khi có
        C13: 0,
        C14: 0,
        C15: 0,
        C16: 0,
        C17: 0,
        C18: 0,
        C19: 0,
        C20: 0,
        C21: 0,
        C22: 0,
        C23: 0,
      },
    };

    const H_values_by_year = {
      2025: {
        H13: 28911,
        H14: 23356,
        H15: 5555,
        H16: 1348,
        H17: 1429,
        H18: 6877,
        H19: 27814,
        H20: 13209,
        H21: 26034,
        H22: 10012,
        H23: 363,
        H33: 72961,
        H34: 24564,
        H35: 48397,
        H36: 19010,
        H37: 0,
        H38: 9313,
        H39: 98101,
        H40: 3670,
        H41: 4229,
        H42: 8977,
        H43: 1877,
      },
      2026: {
        H13: 0,
        H14: 0,
        H15: 0,
        H16: 0,
        H17: 0,
        H18: 0,
        H19: 0,
        H20: 0,
        H21: 0,
        H22: 0,
        H23: 0,
        H33: 0,
        H34: 0,
        H35: 0,
        H36: 0,
        H37: 0,
        H38: 0,
        H39: 0,
        H40: 0,
        H41: 0,
        H42: 0,
        H43: 0,
      },
    };

    // Sau khi build xong result (D, E, J, M)
    // if (year && C_values_by_year[year]) {
    //   Object.assign(result, C_values_by_year[year]);
    // }
    if (year) {
      if (C_values_by_year[year]) Object.assign(result, C_values_by_year[year]);
      if (H_values_by_year[year]) Object.assign(result, H_values_by_year[year]);
    }

    // Gán F13-F23 = E - C
    for (let i = 13; i <= 23; i++) {
      const E = result[`E${i}`] || 0;
      const C = result[`C${i}`] || 0;
      result[`F${i}`] = E - C;
    }

    // Gán F33-F43 = E13..E23 - C13..C23
    for (let i = 13; i <= 23; i++) {
      const E = result[`E${i}`] || 0;
      const C = result[`C${i}`] || 0;
      result[`F${i + 20}`] = E - C;
    }

    // G13-G23 = E - D
    for (let i = 13; i <= 23; i++) {
      const E = result[`E${i}`] || 0;
      const D = result[`D${i}`] || 0;
      result[`G${i}`] = E - D;
    }

    // K13-K23 = J / E
    for (let i = 13; i <= 23; i++) {
      const J = result[`J${i}`] || 0;
      const E = result[`E${i}`] || 0;
      result[`K${i}`] = E !== 0 ? J / E : 0;
    }

    // L13-L23 = J - H
    for (let i = 13; i <= 23; i++) {
      const J = result[`J${i}`] || 0;
      const H = result[`H${i}`] || 0;
      result[`L${i}`] = J - H;
    }

    // N13-N23 = M / D
    for (let i = 13; i <= 23; i++) {
      const M = result[`M${i}`] || 0;
      const D = result[`D${i}`] || 0;
      result[`N${i}`] = D !== 0 ? M / D : 0;
    }

    // O13-O23 = J13-J23
    for (let i = 13; i <= 23; i++) {
      result[`O${i}`] = result[`J${i}`] || 0;
    }

    // P13-P23 = K13-K23
    for (let i = 13; i <= 23; i++) {
      result[`P${i}`] = result[`K${i}`] || 0;
    }

    // Q13-Q23 = O - M
    for (let i = 13; i <= 23; i++) {
      const O = result[`O${i}`] || 0;
      const M = result[`M${i}`] || 0;
      result[`Q${i}`] = O - M;
    }

    // G33-G43 = E - D
    for (let i = 33; i <= 43; i++) {
      const E = result[`E${i}`] || 0;
      const D = result[`D${i}`] || 0;
      result[`G${i}`] = E - D;
    }

    // K33-K43 = J / E
    for (let i = 33; i <= 43; i++) {
      const J = result[`J${i}`] || 0;
      const E = result[`E${i}`] || 0;
      result[`K${i}`] = E !== 0 ? J / E : 0;
    }

    // L33-L43 = J - H
    for (let i = 33; i <= 43; i++) {
      const J = result[`J${i}`] || 0;
      const H = result[`H${i}`] || 0;
      result[`L${i}`] = J - H;
    }

    // N33-N43 = M / D
    for (let i = 33; i <= 43; i++) {
      const M = result[`M${i}`] || 0;
      const D = result[`D${i}`] || 0;
      result[`N${i}`] = D !== 0 ? M / D : 0;
    }

    // O33-O43 = J33-J43
    for (let i = 33; i <= 43; i++) {
      result[`O${i}`] = result[`J${i}`] || 0;
    }

    // P33-P43 = K33-K43
    for (let i = 33; i <= 43; i++) {
      result[`P${i}`] = result[`K${i}`] || 0;
    }

    // Q33-Q43 = O - M
    for (let i = 33; i <= 43; i++) {
      const O = result[`O${i}`] || 0;
      const M = result[`M${i}`] || 0;
      result[`Q${i}`] = O - M;
    }

    return result;
  }
}

module.exports = XFBCService;
