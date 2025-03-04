const app = require ("./app");
const config = require ("./app/config");
const MongoDB = require ("./app/utils/mongodb.util");


async function startServer() {
    try {
        await MongoDB.connect(config.db.uri);
        console.log("Connect to database!");

        const PORT = config.app.port;
        app.listen(PORT, () => {
            console.log(`Server is running port ${PORT}`);
        });
    } catch (error) {
        console.log("Cannot connect to database!", error);
        process.exit();
    }
}

startServer();


