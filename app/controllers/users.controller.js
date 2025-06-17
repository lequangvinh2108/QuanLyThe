const ApiError = require("../api-error");
const UsersService = require("../services/users.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  if (!req.body.user || !req.body.password) {
    return next(new ApiError(400, "User and password are required"));
  }
  try {
    const usersService = new UsersService(MongoDB.client);
    const document = await usersService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while creating the user"));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const usersService = new UsersService(MongoDB.client);
    const documents = await usersService.findAll();
    return res.send(documents);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while retrieving users"));
  }
};

exports.update = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update cannot be empty"));
  }
  try {
    const usersService = new UsersService(MongoDB.client);
    const document = await usersService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "User not found"));
    }
    await usersService.update(req.params.id, req.body);
    return res.send({ message: "User was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Error updating user with id = ${req.params.id}`)
    );
  }
};

exports.updateUser = async (req, res, next) => {
  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Data to update cannot be empty"));
  }
  try {
    const usersService = new UsersService(MongoDB.client);
    const document = await usersService.getUser(req.params.user);
    if (!document) {
      return next(new ApiError(404, "User not found"));
    }
    await usersService.updateUser(req.params.user, req.body);
    return res.send({ message: "User was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error updating user with username = ${req.params.user}`
      )
    );
  }
};

exports.delete = async (req, res, next) => {
  try {
    const usersService = new UsersService(MongoDB.client);
    const document = await usersService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "User not found"));
    }
    await usersService.delete(req.params.id);
    return res.send({ message: "User was deleted successfully" });
  } catch (error) {
    return next(
      new ApiError(500, `Could not delete user with id = ${req.params.id}`)
    );
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const usersService = new UsersService(MongoDB.client);
    const deleteCount = await usersService.deleteAll();
    return res.send({
      message: `${deleteCount} users were deleted successfully`,
    });
  } catch (error) {
    return next(
      new ApiError(500, "An error occurred while removing all users")
    );
  }
};

exports.login = async (req, res, next) => {
  const { user, password } = req.body;
  if (!user || !password) {
    return next(new ApiError(400, "User and Password are required"));
  }
  try {
    const usersService = new UsersService(MongoDB.client);
    const foundUser = await usersService.authenticate(user, password);
    if (!foundUser) {
      return next(new ApiError(401, "Invalid username or password"));
    }
    return res.send({ message: "Login successful", user: foundUser });
  } catch (error) {
    return next(new ApiError(500, "An error occurred during login"));
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const usersService = new UsersService(MongoDB.client);
    const users = await usersService.getAll();
    return res.send(users);
  } catch (error) {
    return next(new ApiError(500, "An error occurred while retrieving users"));
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const usersService = new UsersService(MongoDB.client);
    const user = await usersService.getUser(req.params.user);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }
    return res.send(user);
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error retrieving user with username = ${req.params.user}`
      )
    );
  }
};

exports.getById = async (req, res, next) => {
  try {
    const usersService = new UsersService(MongoDB.client);
    const user = await usersService.getById(req.params.id);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }
    return res.send(user);
  } catch (error) {
    return next(
      new ApiError(500, `Error retrieving user with ID = ${req.params.id}`)
    );
  }
};

exports.updateAuthority = async (req, res, next) => {
  // Giải mã tên người dùng từ URL
  const name = decodeURIComponent(req.params.name);
  console.log("Tên người dùng sau khi giải mã:", name);

  // Kiểm tra nếu authority không có trong body của request
  if (!req.body.authority) {
    console.log("⚠️ Không có authority trong request body!");
    return next(new ApiError(400, "Authority is required"));
  }

  try {
    // In ra thông tin yêu cầu để kiểm tra dữ liệu nhận được
    console.log("🔍 Nhận request cập nhật authority với name:", name);
    console.log("📋 Authority trong request body:", req.body.authority);

    // Khởi tạo service để truy vấn dữ liệu
    const usersService = new UsersService(MongoDB.client);

    // Lấy user từ tên đã giải mã
    const document = await usersService.getUserByName(name);
    if (!document) {
      console.log("⚠️ Không tìm thấy user với tên:", name);
      return next(new ApiError(404, "User not found"));
    }

    // In ra dữ liệu user tìm thấy
    console.log("📌 User tìm thấy:", document);

    // Cập nhật authority cho user
    await usersService.updateAuthority(name, req.body.authority);

    // Thông báo thành công
    console.log("✅ Authority đã được cập nhật cho user =", name);
    return res.send({ message: "Authority was updated successfully" });
  } catch (error) {
    // In ra chi tiết lỗi để hỗ trợ kiểm tra
    console.error("🔥 Lỗi khi cập nhật authority:", error);
    return next(
      new ApiError(
        500,
        `Error updating authority for user = ${name}: ${error.message}`
      )
    );
  }
};

exports.updatePassword = async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new ApiError(400, "New password is required"));
  }

  try {
    const usersService = new UsersService(MongoDB.client);
    const document = await usersService.findById(req.params.id);

    if (!document) {
      return next(new ApiError(404, "User not found"));
    }

    await usersService.updatePassword(req.params.id, password);
    return res.send({ message: "Password was updated successfully" });
  } catch (error) {
    return next(
      new ApiError(
        500,
        `Error updating password for user with id = ${req.params.id}`
      )
    );
  }
};

exports.createMany = async (req, res, next) => {
  if (!Array.isArray(req.body) || req.body.length === 0) {
    return next(new ApiError(400, "User list is required"));
  }
  try {
    const usersService = new UsersService(MongoDB.client);
    const result = await usersService.createMany(req.body); // 👈 nhận object
    return res.send({
      message: `${result.insertedCount} users were created successfully.`,
    });
  } catch (error) {
    console.error("❌ Error in createMany:", error); // ← GHI LOG CỤ THỂ
    return next(
      new ApiError(500, "An error occurred while creating multiple users")
    );
  }
};
