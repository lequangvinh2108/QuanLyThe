const ApiError = require("../api-error");
const DatabaseService = require("../services/database.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
    if (!req.body.hoten) {
        return next(new ApiError(400, "Name cannot be empty"));
    }
    try {
        const databaseService = new DatabaseService(MongoDB.client);
        const document = await databaseService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "An error occurred while creating the record"));
    }
};



exports.findAll = async (req, res, next) => {
    try {
        const databaseService = new DatabaseService(MongoDB.client);
        const documents = await databaseService.findAll();
        return res.send(documents);
    } catch (error) {
        return next(new ApiError(500, "An error occurred while retrieving records"));
    }
};

exports.findOne = async (req, res, next) => {
    try {
        const databaseService = new DatabaseService(MongoDB.client);
        const document = await databaseService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Record not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, `Error retrieving record with id = ${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }
    try {
        const databaseService = new DatabaseService(MongoDB.client);
        const document = await databaseService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Record not found"));
        }
        await databaseService.update(req.params.id, req.body);
        return res.send({ message: "Record was updated successfully" });
    } catch (error) {
        return next(new ApiError(500, `Error updating record with id = ${req.params.id}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const databaseService = new DatabaseService(MongoDB.client);
        const document = await databaseService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Record not found"));
        }
        await databaseService.delete(req.params.id);
        return res.send({ message: "Record was deleted successfully" });
    } catch (error) {
        return next(new ApiError(500, `Could not delete record with id = ${req.params.id}`));
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const databaseService = new DatabaseService(MongoDB.client);
        const deleteCount = await databaseService.deleteAll();
        return res.send({ message: `${deleteCount} records were deleted successfully` });
    } catch (error) {
        return next(new ApiError(500, "An error occurred while removing all records"));
    }
};
