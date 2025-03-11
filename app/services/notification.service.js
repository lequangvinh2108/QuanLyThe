// notifications.service.js
const { ObjectId } = require("mongodb");

class NotificationService {
    constructor(client) {
        this.Notifications = client.db().collection("notifications");
    }

    extractData(payload) {
        return {
            Thongbao: payload.Thongbao,
            Phienban: payload.Phienban,
            NgayCNchuongtrinh: payload.NgayCNchuongtrinh,
            Ngayhieuluc: payload.Ngayhieuluc,
            SizeThongbao: payload.SizeThongbao,
            Hieuluc: payload.Hieuluc,
        };
    }

    async create(payload) {
        const record = this.extractData(payload);
        const result = await this.Notifications.insertOne(record);
        return result.insertedId;
    }

    async find(filter) {
        const cursor = await this.Notifications.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        return await this.Notifications.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async findAll() {
        return await this.find({});
    }

    async getAll() {
        return await this.find({});
    }

    async getById(id) {
        return await this.findById(id);
    }

    async update(id, payload) {
        const filter = { _id: ObjectId.isValid(id) ? new ObjectId(id) : null };
        const update = this.extractData(payload);
        const result = await this.Notifications.findOneAndUpdate(
            filter, { $set: update }, { returnDocument: "after" }
        );
        return result.value;
    }

    async delete(id) {
        const result = await this.Notifications.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    async deleteAll() {
        const result = await this.Notifications.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = NotificationService;
