import express from "express";
import createHttpError from "http-errors";
import TableModel from "./model.js";

import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";

const tableRouter = express.Router();

tableRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const tablesSchema = await TableModel.find();
    res.send(tablesSchema);
  } catch (error) {
    next(error);
  }
});

tableRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const tablesSchema = new TableModel(req.body);
    await tablesSchema.save();
    res.status(201).send(tablesSchema);
  } catch (error) {
    next(error);
  }
});

tableRouter.put(
  "/:tablesSchemaId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const tablesToUpdate = await TableModel.findById(
        req.params.tablesSchemaId
      );
      if (tablesToUpdate) {
        const updatedTablesSchema = await TableModel.findByIdAndUpdate(
          req.params.tablesSchemaId,
          req.body,
          { new: true, runValidators: true }
        );
        res.status(204).send(updatedTablesSchema);
      } else {
        createHttpError(
          404,
          `TablesSchema with id ${req.params.tablesSchemaId} is not Found`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default tableRouter;
