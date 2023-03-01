import mongoose from "mongoose";

const { Schema, model } = mongoose;

const dishesSchema = new Schema({
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  costPrice: { type: Number, required: true },
  description: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "Category" },
  discountRestriction: { type: Boolean, default: false },
  weightableProduct: { type: Boolean, default: false },
});

export default model("Dish", dishesSchema);
