const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");

class UsersService {
    constructor(client) {
        this.Users = client.db().collection("users");
    }

    extractData(payload) {
        return {
            Madonvi: payload.Madonvi,
            MaCN: payload.MaCN,
            user: payload.user,
            password: payload.password, // Mật khẩu sẽ được hash trong hàm create
            name: payload.name,
            shortname: payload.shortname,
            function: payload.function,
            usage_rights: payload.usage_rights,
            authority: payload.authority,
            validity_of_use: payload.validity_of_use,
            menu: payload.menu,
        };
    }

    async create(payload) {
        const record = this.extractData(payload);

        // Kiểm tra nếu có mật khẩu thì mã hóa nó
        if (record.password) {
            const saltRounds = 10;
            record.password = await bcrypt.hash(record.password, saltRounds);
        }

        const result = await this.Users.insertOne(record);
        return result.insertedId;
    }

    async find(filter) {
        const cursor = await this.Users.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        return await this.Users.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async findAll() {
        return await this.find({});
    }

    async update(id, payload) {
        const filter = { _id: ObjectId.isValid(id) ? new ObjectId(id) : null };
        const update = this.extractData(payload);

        // Nếu có mật khẩu mới, hãy mã hóa trước khi cập nhật
        if (update.password) {
            const saltRounds = 10;
            update.password = await bcrypt.hash(update.password, saltRounds);
        }

        const result = await this.Users.findOneAndUpdate(
            filter, { $set: update }, { returnDocument: "after" }
        );
        return result.value;
    }

    async updateUser(user, payload) {
        const filter = { user: user };
        const update = this.extractData(payload);

        // Nếu có mật khẩu mới, hãy mã hóa trước khi cập nhật
        if (update.password) {
            const saltRounds = 10;
            update.password = await bcrypt.hash(update.password, saltRounds);
        }

        const result = await this.Users.findOneAndUpdate(
            filter, { $set: update }, { returnDocument: "after" }
        );
        return result.value;
    }

    async delete(id) {
        const result = await this.Users.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    async deleteAll() {
        const result = await this.Users.deleteMany({});
        return result.deletedCount;
    }

    // 🔥 Hàm kiểm tra đăng nhập 🔥
    async authenticate(user, password) {
        const foundUser = await this.Users.findOne({ user });
        if (!foundUser) return null;

        // So sánh mật khẩu nhập vào với mật khẩu đã hash trong database
        const isMatch = await bcrypt.compare(password, foundUser.password);
        return isMatch ? foundUser : null;
    }

    async getAll() {
        const users = await this.Users.find().toArray();
        return users;
    }

    async getUser(user) {
        return await this.Users.findOne({ user: user });
    }

    async getById(id) {
        if (!ObjectId.isValid(id)) return null;
        return await this.Users.findOne({ _id: new ObjectId(id) });
    }

}

module.exports = UsersService;
