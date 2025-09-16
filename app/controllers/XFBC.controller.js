const XFBCService = require("../services/XFBC.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.importExcel = async (req, res, next) => {
  try {
    const service = new XFBCService(MongoDB.client);
    const document = await service.importExcel(req.file, req.body);
    return res.send({
      message: "Import thành công",
      data: document,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi import Excel"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const service = new XFBCService(MongoDB.client);
    const docs = await service.findAll();
    return res.send(docs);
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách báo cáo XFBC"));
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const service = new XFBCService(MongoDB.client);
    const deletedCount = await service.deleteAll();
    return res.send({ message: `${deletedCount} báo cáo XFBC đã được xóa` });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa tất cả báo cáo XFBC"));
  }
};
exports.generateBC = async (req, res, next) => {
  try {
    const { ngaytruoc, ngaysau } = req.body; // ✅ lấy từ query
    const service = new XFBCService(MongoDB.client);
    const data = await service.generateBC(ngaytruoc, ngaysau);
    return res.send(data);
  } catch (error) {
    console.error("❌ generateBC error:", error);
    return next(new ApiError(500, "Lỗi khi tính toán báo cáo"));
  }
};
