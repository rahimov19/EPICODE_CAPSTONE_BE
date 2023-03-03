import mongoose, { model } from "mongoose";
import bcrypt from "bcrypt";

const { Schema } = mongoose;
const terminalSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    terminalCode: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

terminalSchema.pre("save", async function (next) {
  const terminal = this;
  if (terminal.isModified("terminalCode")) {
    const plainTerminalCode = terminal.terminalCode;
    terminal.terminalCode = await bcrypt.hash(plainTerminalCode, 10);
  }

  next();
});

terminalSchema.methods.toJSON = function () {
  const terminalMongoDoc = this;
  const user = terminalMongoDoc.toObject();
  delete user.terminalCode;
  delete user.__v;
  delete user.createdAt;
  delete user.updatedAt;
  return user;
};

terminalSchema.static(
  "checkTerminalCredentials",
  async function (name, terminalCode) {
    const terminal = await this.findOne({ name });

    if (terminal) {
      const passwordMatch = await bcrypt.compare(
        terminalCode,
        terminal.terminalCode
      );
      if (passwordMatch) {
        return terminal;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
);

export default model("Terminal", terminalSchema);
