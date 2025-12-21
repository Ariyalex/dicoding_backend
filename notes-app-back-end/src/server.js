require("dotenv").config();

const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");
const path = require("path");
const Inert = require("@hapi/inert");

const NotesService = require("./services/postgres/NotesService");
const notes = require("./api/notes");
const NotesValidator = require("./validator/notes");
const ClientError = require("./exceptions/ClientError");
const UsersService = require("./services/postgres/UsersService");
const users = require("./api/users");
const UsersValidator = require("./validator/users");

const authentications = require("./api/authentications");
const AuthenticationsService = require("./services/postgres/AuthenticationsService");
const TokenManager = require("./tokenize/TokenManager");
const AuthenticationsValidator = require("./validator/authentications");
const CollaborationsService = require("./services/postgres/CollaborationsService");
const collaborations = require("./api/collaborations");
const CollaborationsValidator = require("./validator/collaborations");

const _exports = require("./api/exports");
const ProducerService = require("./services/rabbitmq/ProducerService");
const ExportsValidator = require("./validator/exports");
const StorageService = require("./services/storage/StorageService");
const uploads = require("./api/uploads");
const UploadsValidator = require("./validator/uploads");
const CacheService = require("./services/redis/CacheService");

const init = async () => {
  const cacheService = new CacheService();
  const collaborationsService = new CollaborationsService(cacheService);
  const notesService = new NotesService(collaborationsService, cacheService);
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const storageService = new StorageService(
    path.resolve(__dirname, "api/uploads/file/images")
  );

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy("notesapp_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: notesService,
        validator: NotesValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        notesService,
        tokenManager: TokenManager,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: "fail",
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    if (response && response.isBoom) {
      // log full error to terminal for debugging
      console.error("Request error:", {
        message: response.message,
        stack: response.stack,
        output: response.output,
      });
    }

    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

//nambahin comentar doang buat github biar streaknya tidak kelewat

init();
