const { ObjectId } = require("mongodb");

class LeaveOfAbsenceService {
  constructor(client) {
    this.Leave = client.db().collection("leaveofabsence");
  }

  extractData(payload) {
    return {
      hoten: payload.hoten,
      chucvu: payload.chucvu,
      phongban: payload.phongban,
      donvi: payload.donvi,
      tongsongaynghinam: payload.tongsongaynghinam,
      songaydanghi: payload.songaydanghi,
      songaydk: payload.songaydk,
      pheduyentheoVB1409: payload.pheduyentheoVB1409,
      dieuchinhthoigiannghi: payload.dieuchinhthoigiannghi,
      ghichu: payload.ghichu,
      dot: payload.dot,
    };
  }

  async create(payload) {
    const record = this.extractData(payload);
    const result = await this.Leave.insertOne(record);
    return result.insertedId;
  }

  async find(filter) {
    const cursor = await this.Leave.find(filter);
    return await cursor.toArray();
  }

  async findAll() {
    return await this.find({});
  }

  async findById(id) {
    return await this.Leave.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async update(id, payload) {
    const filter = { _id: ObjectId.isValid(id) ? new ObjectId(id) : null };
    const update = this.extractData(payload);
    const result = await this.Leave.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result.value;
  }

  async delete(id) {
    const result = await this.Leave.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result.value;
  }

  async deleteAll() {
    const result = await this.Leave.deleteMany({});
    return result.deletedCount;
  }

  async getAll() {
    const leaves = await this.Leave.find().toArray();
    return leaves;
  }

  async getById(id) {
    if (!ObjectId.isValid(id)) return null;
    return await this.Leave.findOne({ _id: new ObjectId(id) });
  }
}

module.exports = LeaveOfAbsenceService;
