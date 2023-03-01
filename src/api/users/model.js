import mongoose, { model } from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;
const usersSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, uniqie: true },
  password: { type: String, required: true },
  avatar: { type: String },
  terminalCode: {
    type: Number,
    required: true,
    min: 1000,
    max: 9999,
    uniqie: true,
  },
  position: { type: Schema.Types.ObjectId, ref: "Position" },
});

usersSchema.pre("save", async function (next) {
  const currentUser = this;
  if (currentUser.isModified("password")) {
    const plainPassword = currentUser.password;
    currentUser.password = await bcrypt.hash(plainPassword, 10);
  }

  next();
});

usersSchema.methods.toJSON = function () {
  const usersMongoDoc = this;
  const user = usersMongoDoc.toObject();
  delete user.password;
  delete user.__v;
  delete user.createdAt;
  delete user.updatedAt;
  return user;
};

usersSchema.static("checkCredentials", async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("User", usersSchema);
