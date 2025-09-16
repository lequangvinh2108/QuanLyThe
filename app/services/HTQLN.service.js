const { ObjectId } = require("mongodb");

class HTQLNService {
  constructor(client) {
    this.HTQLN = client.db().collection("HTQLN");
  }

  extractData(payload) {
    const record = {
      MaCN: Array.isArray(payload.MaCN) ? payload.MaCN : [],
      TenCN: Array.isArray(payload.TenCN) ? payload.TenCN : [], // ✅ Thêm field TenCN
      MaKH: Array.isArray(payload.MaKH) ? payload.MaKH : [],
      HoTenKH: Array.isArray(payload.HoTenKH) ? payload.HoTenKH : [],
      DuNo: Array.isArray(payload.DuNo) ? payload.DuNo : [],
      Tongduno: payload.Tongduno,
      LoaiNo: payload.LoaiNo,
      NgayNhap: payload.NgayNhap, // dạng chuỗi dd/mm/yyyy
    };

    Object.keys(record).forEach(
      (key) => record[key] === undefined && delete record[key]
    );
    return record;
  }

  async create(payload) {
    const record = this.extractData(payload);
    const result = await this.HTQLN.insertOne(record);
    return result.insertedId;
  }

  async find(filter) {
    const cursor = await this.HTQLN.find(filter);
    return await cursor.toArray();
  }

  async findById(id) {
    return await this.HTQLN.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findAll() {
    return await this.find({});
  }

  async update(id, payload) {
    const filter = { _id: ObjectId.isValid(id) ? new ObjectId(id) : null };
    const update = this.extractData(payload);
    const result = await this.HTQLN.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async delete(id) {
    const result = await this.HTQLN.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result.value;
  }

  async deleteAll() {
    const result = await this.HTQLN.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = HTQLNService;
