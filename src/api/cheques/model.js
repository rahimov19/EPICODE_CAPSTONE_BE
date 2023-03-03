import mongoose from "mongoose";

const { Schema, model } = mongoose;

const chequesSchema = new Schema(
  {
    type: { type: String, enum: ["House", "Delivery"], default: "House" },
    dishes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Dish",
        quantity: { type: Number },
        total: { type: Number },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    table: { type: Schema.Types.ObjectId, ref: "Table" },
    numberOfGuests: { type: Number, default: 1 },
    chequeTotal: { type: Number },
    client: { type: Schema.Types.ObjectId, ref: "Client" },
    status: { type: String, enum: ["Active", "Closed", "Paid", "Deleted"] },
  },
  { timestamps: true }
);

export default model("Cheque", chequesSchema);
