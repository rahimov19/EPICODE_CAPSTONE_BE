import express from "express";
import createHttpError from "http-errors";
import q2m from "query-to-mongo";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import ChequesModel from "./model.js";

const chequesRouter = express.Router();

chequesRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const cheques = await ChequesModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    );
    res.send(cheques);
  } catch (error) {
    next(error);
  }
});
chequesRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const cheque = new ChequesModel(req.body);
    await cheque.save();
    res.status(201).send(cheque);
  } catch (error) {
    next(error);
  }
});

chequesRouter.get("/:chequeId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const cheque = await ChequesModel.findById(req.params.chequeId);
    if (cheque) {
      res.send(cheque);
    } else {
      createHttpError(
        404,
        `Cheque with id ${req.params.chequeId} is not Found`
      );
    }
  } catch (error) {
    next(error);
  }
});
chequesRouter.put("/:chequeId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const chequeToUpdate = await ChequesModel.findById(req.params.chequeId);
    if (chequeToUpdate) {
      const updatedCheque = ChequesModel.findByIdAndUpdate(
        req.params.chequeId,
        req.body,
        { new: true, runValidators: true }
      );
      res.status(204).send(updatedCheque);
    } else {
      createHttpError(
        404,
        `Cheque with id ${req.params.chequeId} is not Found`
      );
    }
  } catch (error) {
    next(error);
  }
});
chequesRouter.delete(
  "/:chequeId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const chequeToDelete = await ChequesModel.findById(req.params.chequeId);
      if (chequeToDelete) {
        const deletedCheque = ChequesModel.findByIdAndDelete(
          req.params.chequeId
        );
        res.status(205).send();
      } else {
        createHttpError(
          404,
          `Cheque with id ${req.params.chequeId} is not Found`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default chequesRouter;
