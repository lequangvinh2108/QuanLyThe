// const { MongoClinet } = require ("mongodb");

// class MongoDB {
//     static connect = async (uri) => {
//         if (this.client) return this.client;
//         this.client = await MongoClinet.connect(uri);
//         return this.client;
//     };
// }

// module.exports = MongoDB;

const { MongoClient } = require("mongodb");

class MongoDB {
    static async connect(uri) {
        if (this.client) return this.client;
        this.client = await MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        return this.client;
    }
}

module.exports = MongoDB;