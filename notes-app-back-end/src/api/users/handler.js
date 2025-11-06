const NotFoundError = require("../../exceptions/NotFoundError");

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const userId = await this._service.addUser({
      username,
      password,
      fullname,
    });

    const response = h.response({
      status: "success",
      message: "User berhasil ditambahkan",
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }

  async getUserByIdHandler(request, h) {
    try {
      console.log("Getting user with ID:", request.params.id);
      const { id } = request.params;
      const user = await this._service.getUserById(id);
      console.log("User found:", user);

      return {
        status: "success",
        data: {
          user,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(404);
        return response;
      }

      console.error("Unexpected error:", error.message, error.stack);

      const response = h.response({
        status: "error",
        message: "Terjadi kesalahan pada server",
      });
      response.code(500);

      // Re-throw other errors to be handled by server
      throw error;
    }
  }
}

module.exports = UsersHandler;
