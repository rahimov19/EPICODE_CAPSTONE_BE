import express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import ClientModel from "./model.js";

const clientsRouter = express.Router();

clientsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const clients = await ClientModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    );
    res.send(clients);
  } catch (error) {
    next(error);
  }
});
clientsRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const client = new ClientModel(req.body);
    await client.save();
    res.status(201).send(client);
  } catch (error) {
    next(error);
  }
});

clientsRouter.get("/:clientId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const client = await ClientModel.findById(req.params.clientId);
    if (client) {
      res.send(client);
    } else {
      createHttpError(
        404,
        `Client with id ${req.params.clientId} is not Found`
      );
    }
  } catch (error) {
    next(error);
  }
});
clientsRouter.put("/:clientId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const clientToUpdate = await ClientModel.findById(req.params.clientId);
    if (clientToUpdate) {
      const updatedClient = await ClientModel.findByIdAndUpdate(
        req.params.clientId,
        req.body,
        { new: true, runValidators: true }
      );
      res.status(204).send(updatedClient);
    } else {
      createHttpError(
        404,
        `Client with id ${req.params.clientId} is not Found`
      );
    }
  } catch (error) {
    next(error);
  }
});
clientsRouter.delete(
  "/:clientId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const clientToDelete = await ClientModel.findById(req.params.clientId);
      if (clientToDelete) {
        const deletedClient = await ClientModel.findByIdAndDelete(
          req.params.clientId
        );
        res.status(205).send();
      } else {
        createHttpError(
          404,
          `Client with id ${req.params.clientId} is not Found`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default clientsRouter;
