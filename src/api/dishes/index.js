import express from "express";
import createHttpError from "http-errors";
import DishModel from "./model.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import q2m from "query-to-mongo";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import CategoryModel from "./catModel.js";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      format: "jpeg",
      folder: "capstoneDishes",
    },
  }),
}).single("dish");

const cloudinaryUploader2 = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      format: "jpeg",
      folder: "capstoneCategories",
    },
  }),
}).single("category");

const dishesRouter = express.Router();

dishesRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const dishes = await DishModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    ).populate("category");
    res.send(dishes);
  } catch (error) {
    next(error);
  }
});
dishesRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const dish = new DishModel(req.body);
    await dish.save();
    res.status(201).send(dish);
  } catch (error) {
    next(error);
  }
});

dishesRouter.post(
  "/:dishId/image",
  JWTAuthMiddleware,
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const url = req.file.path;
      const updatedCategory = await DishModel.findByIdAndUpdate(
        req.params.dishId,
        { image: url },
        { new: true, runValidators: true }
      );
      if (updatedCategory) {
        res.status(204).send(updatedCategory);
      } else {
        createHttpError(404, `Dish with id ${req.params.dishId} is not Found`);
      }
    } catch (error) {
      next(error);
    }
  }
);

dishesRouter.post("/category", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const category = new CategoryModel(req.body);
    await category.save();
    res.status(201).send(category);
  } catch (error) {
    next(error);
  }
});

dishesRouter.post(
  "/category/:catId",
  JWTAuthMiddleware,
  cloudinaryUploader2,
  async (req, res, next) => {
    try {
      const url = req.file.path;
      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        req.params.catId,
        { cover: url },
        { new: true, runValidators: true }
      );
      if (updatedCategory) {
        res.status(204).send(updatedCategory);
      } else {
        createHttpError(
          404,
          `Category with id ${req.params.catId} is not Found`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);
dishesRouter.get("/category", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const categories = await CategoryModel.find();
    res.send(categories);
  } catch (error) {
    next(error);
  }
});
dishesRouter.get("/:dishId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const dish = await DishModel.findById(req.params.dishId).populate(
      "category"
    );
    if (dish) {
      res.send(dish);
    } else {
      createHttpError(404, `Dish with id ${req.params.dishId} is not Found`);
    }
  } catch (error) {
    next(error);
  }
});
dishesRouter.put("/:dishId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const dishToUpdate = await DishModel.findById(req.params.dishId);
    if (dishToUpdate) {
      const updatedDish = await DishModel.findByIdAndUpdate(
        req.params.dishId,
        req.body,
        { new: true, runValidators: true }
      );
      res.status(204).send(updatedDish);
    } else {
      createHttpError(404, `Dish with id ${req.params.dishId} is not Found`);
    }
  } catch (error) {
    next(error);
  }
});
dishesRouter.delete("/:dishId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const dishToDelete = await DishModel.findById(req.params.dishId);
    if (dishToDelete) {
      const deletedDish = await DishModel.findByIdAndDelete(req.params.dishId);
      res.status(205).send();
    } else {
      createHttpError(404, `Dish with id ${req.params.dishId} is not Found`);
    }
  } catch (error) {
    next(error);
  }
});

export default dishesRouter;
