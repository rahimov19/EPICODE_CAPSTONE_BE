import mongoose, { model } from "mongoose";

const { Schema } = mongoose;
const terminalSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    terminalCode: { type: String, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

terminalSchema.static(
  "checkTerminalCredentials",
  async function (name, terminalCode) {
    const terminal = await this.findOne({ name });

    if (terminal) {
      if (terminalCode === terminal.terminalCode) {
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
