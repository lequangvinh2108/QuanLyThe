const ApiError = require("../api-error");
const LeaveOfAbsenceService = require("../services/leaveofabsence.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  try {
    const leaveService = new LeaveOfAbsenceService(MongoDB.client);
    const document = await leaveService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while creating the leave record")
    );
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const leaveService = new LeaveOfAbsenceService(MongoDB.client);
    const documents = await leaveService.findAll();
    return res.send(documents);
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while retrieving leave records")
    );
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const leaveService = new LeaveOfAbsenceService(MongoDB.client);
    const document = await leaveService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Leave record not found"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving leave record with id = ${req.params.id}`
      )
    );
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update cannot be empty"));
  }
  try {
    const leaveService = new LeaveOfAbsenceService(MongoDB.client);
    const document = await leaveService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Leave record not found"));
    }
    await leaveService.update(req.params.id, req.body);
    return res.send({ message: "Leave record was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error updating leave record with id = ${req.params.id}`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const leaveService = new LeaveOfAbsenceService(MongoDB.client);
    const document = await leaveService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Leave record not found"));
    }
    await leaveService.delete(req.params.id);
    return res.send({ message: "Leave record was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Could not delete leave record with id = ${req.params.id}`
      )
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const leaveService = new LeaveOfAbsenceService(MongoDB.client);
    const deleteCount = await leaveService.deleteAll();
    return res.send({
      message: `${deleteCount} leave records were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all leave records")
    );
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const leaveService = new LeaveOfAbsenceService(MongoDB.client);
    const leaves = await leaveService.getAll();
    return res.send(leaves);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while retrieving users"));
  }
};

exports.getById = async (req, res, next) => {
  try {
    const leaveService = new LeaveOfAbsenceService(MongoDB.client);
    const leaves = await leaveService.getById(req.params.id);
    if (!leaves) {
      return next(new ApiError(404, "User not found"));
    }
    return res.send(leaves);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving leaves with ID = ${req.params.id}`)
    );
  }
};
