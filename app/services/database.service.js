const { ObjectId } = require("mongodb");

class DatabaseService {
    constructor(client) {
        this.Database = client.db().collection("database");
    }

    extractData(payload) {
        const record = {
            Madonvi: payload.Madonvi,
            MaCN: payload.MaCN,
            tenCN: payload.tenCN,
            ngaydk: payload.ngaydk,
            MaKH: payload.MaKH,
            hoten: payload.hoten,
            hotenenglish: payload.hotenenglish,
            tentattv: payload.tentattv,
            tenta: payload.tenta,
            tentatta: payload.tentatta,
            ngaysinh: payload.ngaysinh,
            gioitinh: payload.gioitinh,
            cmnd: payload.cmnd,
            ngaycap: payload.ngaycap,
            manoicapCMT: payload.manoicapCMT,
            noicap: payload.noicap,
            noisinh: payload.noisinh,
            diachitt: payload.diachitt,
            province: payload.province,
            district: payload.district,
            commune: payload.commune,
            dcnharieng: payload.dcnharieng,
            Noicongtac: payload.Noicongtac,
            dienthoai: payload.dienthoai,
            dtdd: payload.dtdd,
            sofax: payload.sofax,
            dcemail: payload.dcemail,
            nhanvienNN: payload.nhanvienNN,
            QuanlyNN: payload.QuanlyNN,
            TukinhdoanhNN: payload.TukinhdoanhNN,
            congnhanNN: payload.congnhanNN,
            congchucNN: payload.congchucNN,
            nongdanNN: payload.nongdanNN,
            sinhvienNN: payload.sinhvienNN,
            khacNN: payload.khacNN,
            motaikhoan: payload.motaikhoan,
            khongDYMTK: payload.khongDYMTK,
            lydokhongMTK: payload.lydokhongMTK,
            phathanhthe: payload.phathanhthe,
            khongPHthe: payload.khongPHthe,
            lydokhongPHT: payload.lydokhongPHT,
            diachiNN: payload.diachiNN,
            dienthoaiNN: payload.dienthoaiNN,
            chucvuNN: payload.chucvuNN,
            SoQDTL: payload.SoQDTL,
            ngaycapQDTL: payload.ngaycapQDTL,
            noicapQDTL: payload.noicapQDTL,
            SoDKKD: payload.SoDKKD,
            ngaycapDKKD: payload.ngaycapDKKD,
            noicapDKKD: payload.noicapDKKD,
            MST: payload.MST,
            ngaycapMST: payload.ngaycapMST,
            noicapMST: payload.noicapMST,
            ttthe: payload.ttthe,
            daidienA: payload.daidienA,
            chucvuA: payload.chucvuA,
            kiemsoat: payload.kiemsoat,
            taikhoan: payload.taikhoan,
            tenGDvien: payload.tenGDvien,
            MaGDvien: payload.MaGDvien,
            ngayphathanh: payload.ngayphathanh,
            ngaydenhan: payload.ngaydenhan,
            loaikh: payload.loaikh,
            noiky: payload.noiky,
            thesuccess: payload.thesuccess,
            thelapnghiep: payload.thelapnghiep,
            thevisaDebit: payload.thevisaDebit,
            theghinoqt: payload.theghinoqt,
            thetindungqt: payload.thetindungqt,
            thelienketsv: payload.thelienketsv,
            thebachkim: payload.thebachkim,
            DKPHTheGNnoidia: payload.DKPHTheGNnoidia,
            themaster: payload.themaster,
            thechuan: payload.thechuan,
            thevang: payload.thevang,
            thePHthuong: payload.thePHthuong,
            thePHnhanh: payload.thePHnhanh,
            DKSMSbanking: payload.DKSMSbanking,
            DKDTDDSMS: payload.DKDTDDSMS,
            DVInternet: payload.DVInternet,
            quoctich: payload.quoctich,
            Dantoc: payload.Dantoc,
            tongiao: payload.tongiao,
            cutru: payload.cutru,

            //
            ddk: payload.ddk, //ngay ky
            mdk: payload.mdk, //thang ky
            ydk: payload.ydk, //nam ky

            //
            dtnghenghiep: payload.dtnghenghiep,
            diachiCN: payload.diachiCN,
        };
        
        // Remove undefined fields
        Object.keys(record).forEach(key => record[key] === undefined && delete record[key]);
        return record;
    }

    async create(payload) {
        const record = this.extractData(payload);
        const result = await this.Database.insertOne(record);
        return result.insertedId;
    }

    async find(filter) {
        const cursor = await this.Database.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        return await this.Database.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async findAll() {
        return await this.find({});
    }

    async update(id, payload) {
        const filter = { _id: ObjectId.isValid(id) ? new ObjectId(id) : null };
        const update = this.extractData(payload);
        const result = await this.Database.findOneAndUpdate(
            filter, { $set: update }, { returnDocument: "after" }
        );
        return result.value;
    }

    async delete(id) {
        const result = await this.Database.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    async deleteAll() {
        const result = await this.Database.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = DatabaseService;
