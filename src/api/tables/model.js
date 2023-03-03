import mongoose from "mongoose";

const { Schema, model } = mongoose;

const tablesSchema = new Schema(
  {
    name: { type: String },
  },
  { timestamps: true }
);

export default model("Table", tablesSchema);
