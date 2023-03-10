import mongoose from "mongoose";

const { Schema, model } = mongoose;

const tablesSchema = new Schema(
  {
    schema: [],
  },
  { timestamps: true }
);

export default model("Table", tablesSchema);
