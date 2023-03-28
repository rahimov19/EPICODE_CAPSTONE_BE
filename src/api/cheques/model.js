import mongoose from "mongoose";

const { Schema, model } = mongoose;

const chequesSchema = new Schema(
  {
    type: { type: String, enum: ["House", "Delivery"], default: "House" },
    dishes: [
      {
        dish: {
          type: Schema.Types.ObjectId,
          ref: "Dish",
        },
        quantity: { type: Number },
        total: { type: Number },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    table: { type: String },
    numberOfGuests: { type: Number, default: 1 },
    chequeTotal: { type: Number },
    client: { type: Schema.Types.ObjectId, ref: "Client" },
    status: { type: String, enum: ["Active", "Closed", "Paid", "Deleted"] },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    amountPaid: { type: Number },
    chequeNumber: { type: Number },
  },
  { timestamps: true }
);

chequesSchema.pre("save", async function (next) {
  const currentCheque = this;
  const model = this.constructor;
  const lastCheque = await model.find().sort({ chequeNumber: -1 }).limit(1);
  if (lastCheque.length === 0) {
    currentCheque.chequeNumber = 1;
    next();
  } else {
    const lastNumber = lastCheque[0].chequeNumber;
    currentCheque.chequeNumber = lastNumber + 1;
  }
});

export default model("Cheque", chequesSchema);
