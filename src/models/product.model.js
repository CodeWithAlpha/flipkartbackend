import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
 title: {
  type: String,
  required: true,
  trim: true,
 },
 description: {
  type: String,
  required: true,
  trim: true,
 },
 category: {
  type: Schema.Types.ObjectId,
  ref: "categories",
  required: true,
 },
 price: {
  type: Number,
  required: true,
 },
 discountPercentage: {
  type: Number,
  required: true,
 },
 stock: {
  type: Number,
  required: true,
 },
 thumbnail: {
  type: String,
  required: true,
 },
});

export const Product = mongoose.model("Product", productSchema);
