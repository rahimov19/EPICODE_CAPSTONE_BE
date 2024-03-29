import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import listEndpoints from "express-list-endpoints";
import createHttpError from "http-errors";
import {
  badRequestHandler,
  forbiddenHandler,
  genericErrorHAndler,
  unauthorizedHandler,
  notFoundHandler,
} from "./errorHandlers.js";
import dishesRouter from "./api/dishes/index.js";
import usersRouter from "./api/users/index.js";
import chequesRouter from "./api/cheques/index.js";
import clientsRouter from "./api/clients/index.js";
import tableRouter from "./api/tables/index.js";

const server = express();
const port = process.env.PORT || 3001;

const whitelist = [process.env.FE_URL, process.env.FE_URL_PROD];

const corsOpts = {
  origin: (origin, corsNext) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      corsNext(null, true);
    } else {
      corsNext(createHttpError(400, "Current Origin is not in whitelist"));
    }
  },
};

server.use(cors());
server.use(express.json());

server.use("/users", usersRouter);
server.use("/dishes", dishesRouter);
server.use("/cheques", chequesRouter);
server.use("/clients", clientsRouter);
server.use("/table", tableRouter);

server.use(badRequestHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(notFoundHandler);
server.use(genericErrorHAndler);

mongoose.connect(process.env.MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("Connected to DB");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port: ${port}`);
  });
});
