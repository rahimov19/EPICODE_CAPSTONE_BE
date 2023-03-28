import mongoose from "mongoose";

const { Schema, model } = mongoose;

const clientSchema = new Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: Number },
    noDiscount: { type: Boolean, default: false },
    deliveryAddress: { type: String },
    cheques: [{ type: Schema.Types.ObjectId, ref: "Cheque" }],
    dateOfBirth: { type: Date },
    email: { type: String },
    address: { type: String },
    city: { type: String },
    comment: { type: String },
    personalDiscount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default model("Client", clientSchema);
