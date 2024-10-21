import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({
 categoryName: {
  type: String,
  required: true,
 },
 image: {
  type: String,
 },
});

export const Category = mongoose.model("category", categorySchema);
