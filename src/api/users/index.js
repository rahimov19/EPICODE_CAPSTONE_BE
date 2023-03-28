import express from "express";
import createHttpError from "http-errors";
import UsersModel from "./model.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import q2m from "query-to-mongo";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import { createAccessToken } from "../../lib/auth/jwtTools.js";
import PositionModel from "./positionModel.js";
import TerminalModel from "./terminalModel.js";
import bcrypt from "bcrypt";

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      format: "jpeg",
      folder: "capstoneUsers",
    },
  }),
}).single("avatar");

const usersRouter = express.Router();

usersRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const mongoQuery = q2m(req.query);
    const users = await UsersModel.find(
      mongoQuery.criteria,
      mongoQuery.options.fields
    ).populate("position");
    res.send(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UsersModel.checkCredentials(email, password);
    if (user) {
      const payload = {
        _id: user._id,
        terminalCode: user.terminalCode,
      };
      const accessToken = await createAccessToken(payload);
      res.send({ user, accessToken });
    } else {
      next(createHttpError(401, "Credentials are not OK!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/position", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const newPosition = new PositionModel(req.body);
    await newPosition.save();
    res.status(201).send(newPosition);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/position", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const positions = await PositionModel.find();
    res.send(positions);
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const emailAlreadyRegistered = await UsersModel.findOne({ email: email });
    if (emailAlreadyRegistered) {
      return next(
        createHttpError(400, `User with provided email already exists`)
      );
    }
    const newUser = new UsersModel(req.body);
    await newUser.save();
    if (
      (newUser && email && password && name) ||
      (newUser && email && password && name && avatar)
    ) {
      const payload = {
        _id: newUser._id,
        terminalCode: newUser.terminalCode,
      };

      const accessToken = await createAccessToken(payload);
      res.status(201).send({ user: newUser, accessToken: accessToken });
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User with provided id not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.user._id);
    if (user) {
      if (req.body.password) {
        const plainPassword = req.body.password;
        req.body.password = await bcrypt.hash(plainPassword, 10);
      }
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.user._id,
        req.body,
        { new: true, runValidators: true }
      );
      res.status(204).send(updatedUser);
    } else {
      next(createHttpError(404, `User with the provided id not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post(
  "/me/avatar",
  JWTAuthMiddleware,
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const url = req.file.path;
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.user._id,
        { avatar: url },
        { new: true, runValidators: true }
      );
      if (updatedUser) {
        res.status(204).send(updatedUser);
      } else {
        next(createHttpError(404, `User with id ${req.user._id} not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.get("/terminal", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const terminal = await TerminalModel.find();

    res.status(200).send(terminal);
  } catch (error) {
    next(error);
  }
});

export default usersRouter;

usersRouter.get("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const user = await UsersModel.findById(req.params.userId);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User with provided id not found`));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userToChange = await UsersModel.findById(req.params.userId);
    if (userToChange) {
      if (req.body.password) {
        const plainPassword = req.body.password;
        req.body.password = await bcrypt.hash(plainPassword, 10);
      }
      const updatedUser = await UsersModel.findByIdAndUpdate(
        req.params.userId,
        req.body,
        { new: true, runValidators: true }
      );
      res.status(204).send(updatedUser);
    } else {
      createHttpError(404, `User with id ${req.params.userId} is not found`);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.delete("/:userId", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userToDelete = await UsersModel.findById(req.params.userId);
    if (userToDelete) {
      await UsersModel.findByIdAndDelete(req.params.userId);
      res.status(205).send();
    } else {
      createHttpError(404, `User with id ${req.params.userId} is not found`);
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.post("/terminal", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const terminal = new TerminalModel(req.body);
    await terminal.save();
    res.send(terminal);
  } catch (error) {
    next(error);
  }
});
usersRouter.post("/terminal/login", async (req, res, next) => {
  try {
    const { name, terminalCode } = req.body;
    const terminal = await TerminalModel.checkTerminalCredentials(
      name,
      terminalCode
    );
    if (terminal) {
      const payload = {
        _id: terminal._id,
        terminalCode: terminal.terminalCode,
      };
      const accessToken = await createAccessToken(payload);
      res.send({ terminal, accessToken });
    } else {
      next(createHttpError(401, "Credentials are not OK!"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.put(
  "/position/:positionId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const positionToChange = await PositionModel.findById(
        req.params.positionId
      );
      if (positionToChange) {
        const updatedPosition = await PositionModel.findByIdAndUpdate(
          req.params.positionId,
          req.body,
          { new: true, runValidators: true }
        );
        res.status(204).send(updatedPosition);
      } else {
        createHttpError(
          404,
          `Position with id ${req.params.positionId} is not found`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.delete(
  "/position/:positionId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const positionToDelete = await PositionModel.findById(
        req.params.positionId
      );
      if (positionToDelete) {
        await PositionModel.findByIdAndDelete(req.params.positionId);
        res.status(205).send();
      } else {
        createHttpError(
          404,
          `Position with id ${req.params.positionId} is not found`
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.put(
  "/terminal/:terminalId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const terminal = await TerminalModel.findById(req.params.terminalId);
      if (terminal) {
        const updatedTerminal = await TerminalModel.findByIdAndUpdate(
          req.params.terminalId,
          req.body,
          { new: true, runValidators: true }
        );
        res.status(204).send(updatedTerminal);
      } else {
        next(createHttpError(404, `Terminal with the provided id not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

usersRouter.delete(
  "/terminal/:terminalId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const terminal = await TerminalModel.findById(req.params.terminalId);
      if (terminal) {
        const deletedTerminal = await TerminalModel.findByIdAndDelete(
          req.params.terminalId
        );
        res.status(205).send();
      } else {
        next(createHttpError(404, `Terminal with the provided id not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);
