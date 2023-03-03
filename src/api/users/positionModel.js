import mongoose, { model } from "mongoose";

const { Schema } = mongoose;
const positionSchema = new Schema(
  {
    name: { type: String, required: true },
    stats: { type: Boolean, default: false },
    finance: { type: Boolean, default: false },
    menu: { type: Boolean, default: false },
    warehouse: { type: Boolean, default: false },
    access: { type: Boolean, default: false },
    accountSettings: { type: Boolean, default: false },
    terminalAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Position", positionSchema);
