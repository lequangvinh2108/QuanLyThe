const { ObjectId } = require("mongodb");

class BaoCaoTTService {
  constructor(client) {
    this.BaoCaoTT = client.db().collection("BaoCaoTT");
  }

  extractData(payload) {
    const record = {
      DNTT: payload.DNTT,
      NN2TT: payload.NN2TT,
      NN1TT: payload.NN1TT,
      NXTT: payload.NXTT,
      TLNXTT: payload.TLNXTT,
      NgayNhap: payload.NgayNhap, // nhập tay
      MaCN: payload.MaCN, // 👈 thêm
      tongdunoCN: payload.tongdunoCN, // 👈 thêm
      nhom2CN: payload.nhom2CN,
      nhom1CN: payload.nhom1CN,
      rows: payload.rows, // 👈 thêm
    };

    Object.keys(record).forEach(
      (key) => record[key] === undefined && delete record[key]
    );
    return record;
  }

  async create(payload) {
    const record = this.extractData(payload);
    const result = await this.BaoCaoTT.insertOne(record);
    return result.insertedId;
  }

  async createMany(list) {
    const result = await this.BaoCaoTT.insertMany(list);
    return result;
  }

  async find(filter) {
    return await this.BaoCaoTT.find(filter).toArray();
  }

  async findById(id) {
    return await this.BaoCaoTT.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async findAll() {
    return await this.find({});
  }

  async update(id, payload) {
    const filter = { _id: ObjectId.isValid(id) ? new ObjectId(id) : null };
    const update = this.extractData(payload);
    const result = await this.BaoCaoTT.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async delete(id) {
    const result = await this.BaoCaoTT.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result.value;
  }

  async deleteAll() {
    const result = await this.BaoCaoTT.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = BaoCaoTTService;
