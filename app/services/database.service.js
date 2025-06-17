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
            tenta: payload.tenta,   //
            tentatta: payload.tentatta,
            ngaysinh: payload.ngaysinh,
            gioitinh: payload.gioitinh,
            cmnd: payload.cmnd,
            ngaycap: payload.ngaycap,
            noicap: payload.noicap,
            NgayHethanHL: payload.NgayHethanHL,
            noisinh: payload.noisinh,
            quoctich: payload.quoctich,
            Dantoc: payload.Dantoc,
            tongiao: payload.tongiao,
            cutru: payload.cutru,
            diachitt: payload.diachitt,
            dcnharieng: payload.dcnharieng,
            dienthoai: payload.dienthoai,
            dtdd: payload.dtdd,
            sofax: payload.sofax,
            dcemail: payload.dcemail,
            motaikhoan: payload.motaikhoan, //
            daidienA: payload.daidienA,
            chucvuA: payload.chucvuA,
            kiemsoat: payload.kiemsoat,
            taikhoan: payload.taikhoan,
            TenGDV: payload.TenGDV,
            MaGDvien: payload.MaGDvien,
            ngayphathanh: payload.ngayphathanh,
            ngaydenhan: payload.ngaydenhan,
            noiky: payload.noiky,

            tentrenthe: payload.tentrenthe,
            loaithe: payload.loaithe,
            DKPHTheGNnoidia: payload.DKPHTheGNnoidia, //
            thevisaDebit: payload.thevisaDebit, //
            thelapnghiep: payload.thelapnghiep, //
            themaster: payload.themaster, //
            thelkthuonghieu: payload.thelkthuonghieu,
            thejcb: payload.thejcb,
            thekhac: payload.thekhac,
            
            hangthe: payload.hangthe,
            theplussuccess: payload.theplussuccess,
            thesuccess: payload.thesuccess, //
            thevang: payload.thevang, //
            thechuan: payload.thechuan, //
            thebachkim: payload.thebachkim, //
            thekimcuong: payload.thekimcuong,

            thePHthuong: payload.thePHthuong, //
            thePHnhanh: payload.thePHnhanh, 
            
            AgribankPlus: payload.AgribankPlus,
            sdtAP: payload.sdtAP,
            Ecommerce: payload.Ecommerce,
            LKvidientu: payload.LKvidientu,
            DKSMSbanking: payload.DKSMSbanking, //
            BANKPLUS: payload.BANKPLUS,

            ddk: payload.ddk, //ngay ky
            mdk: payload.mdk, //thang ky
            ydk: payload.ydk, //nam ky
            dtnghenghiep: payload.dtnghenghiep,
            diachiCN: payload.diachiCN,
            sofaxNH: payload.sofaxNH,
            dangkyDV: payload.dangkyDV,
            loaitien: payload.loaitien,
            abic: payload.abic,

            hinhthucnhanthe: payload.hinhthucnhanthe,
            NTtainganhang: payload.NTtainganhang,
            NTquabuudien: payload.NTquabuudien,

            PHlandau: payload.PHlandau,
            PHlai: payload.PHlai,

            // thelienketsv: payload.thelienketsv, //
            // thetindungqt: payload.thetindungqt, //
            // theghinoqt: payload.theghinoqt, //
            // DKDTDDSMS: payload.DKDTDDSMS, //
            // MPLUS: payload.MPLUS,
            // SDTDKMB: payload.SDTDKMB,
            // DVInternet: payload.DVInternet, 
            // DVtaichinh: payload.DVtaichinh,
            // DVthanhtoan: payload.DVthanhtoan,
            // DVphitaichinh: payload.DVphitaichinh,
            // chucvu: payload.chucvu,
            
            // manoicapCMT: payload.manoicapCMT, //
            // province: payload.province,  //
            // district: payload.district, //
            // commune: payload.commune, //
            // Noicongtac: payload.Noicongtac, //
            // nhanvienNN: payload.nhanvienNN, //
            // QuanlyNN: payload.QuanlyNN, //
            // TukinhdoanhNN: payload.TukinhdoanhNN, //
            // congnhanNN: payload.congnhanNN, //
            // congchucNN: payload.congchucNN, //
            // nongdanNN: payload.nongdanNN, //
            // sinhvienNN: payload.sinhvienNN, //
            // khacNN: payload.khacNN, //
            
            // khongDYMTK: payload.khongDYMTK, //
            // lydokhongMTK: payload.lydokhongMTK, //
            // phathanhthe: payload.phathanhthe, //
            // khongPHthe: payload.khongPHthe, //
            // lydokhongPHT: payload.lydokhongPHT, //
            // diachiNN: payload.diachiNN,  //
            // dienthoaiNN: payload.dienthoaiNN, //
            // chucvuNN: payload.chucvuNN, //
            // SoQDTL: payload.SoQDTL, //
            // ngaycapQDTL: payload.ngaycapQDTL, //
            // noicapQDTL: payload.noicapQDTL, //
            // SoDKKD: payload.SoDKKD, //
            // ngaycapDKKD: payload.ngaycapDKKD, //
            // noicapDKKD: payload.noicapDKKD, //
            // MST: payload.MST, //
            // ngaycapMST: payload.ngaycapMST, //
            // noicapMST: payload.noicapMST, //
            // //
            // ttthe: payload.ttthe, //
            // loaikh: payload.loaikh, //
            // ngayhd: payload.ngayhd,
            // thanghd: payload.thanghd,
            // namhd: payload.namhd,
            //
            
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
