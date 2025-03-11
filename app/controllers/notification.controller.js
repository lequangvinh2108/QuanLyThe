// notifications.controller.js
const ApiError = require("../api-error");
const NotificationService = require("../services/notification.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
    if (!req.body.Thongbao || !req.body.Phienban) {
        return next(new ApiError(400, "Thongbao and Phienban are required"));
    }
    try {
        const notificationService = new NotificationService(MongoDB.client);
        const document = await notificationService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(new ApiError(500, "An error occurred while creating the notification"));
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MongoDB.client);
        const documents = await notificationService.getAll();
        return res.send(documents);
    } catch (error) {
        return next(new ApiError(500, "An error occurred while retrieving notifications"));
    }
};

exports.getById = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MongoDB.client);
        const notification = await notificationService.getById(req.params.id);
        if (!notification) {
            return next(new ApiError(404, "Notification not found"));
        }
        return res.send(notification);
    } catch (error) {
        return next(new ApiError(500, `Error retrieving notification with ID = ${req.params.id}`));
    }
};

exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be empty"));
    }
    try {
        const notificationService = new NotificationService(MongoDB.client);
        const document = await notificationService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Notification not found"));
        }
        await notificationService.update(req.params.id, req.body);
        return res.send({ message: "Notification was updated successfully" });
    } catch (error) {
        return next(new ApiError(500, `Error updating notification with id = ${req.params.id}`));
    }
};

exports.delete = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MongoDB.client);
        const document = await notificationService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Notification not found"));
        }
        await notificationService.delete(req.params.id);
        return res.send({ message: "Notification was deleted successfully" });
    } catch (error) {
        return next(new ApiError(500, `Could not delete notification with id = ${req.params.id}`));
    }
};

exports.deleteAll = async (req, res, next) => {
    try {
        const notificationService = new NotificationService(MongoDB.client);
        const deleteCount = await notificationService.deleteAll();
        return res.send({ message: `${deleteCount} notifications were deleted successfully` });
    } catch (error) {
        return next(new ApiError(500, "An error occurred while removing all notifications"));
    }
};
