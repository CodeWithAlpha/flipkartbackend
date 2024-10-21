import { Category } from "../models/category.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const AddCategory = asyncHandler(async (req, res) => {
 const { categoryName } = req.body;
 // validation - not empty
 if ([categoryName].some((field) => field?.trim() === "")) {
  res.status(200).json(new ApiResponse(409, null, "category name is required"));
 }

 const categoryImage = req.files?.image[0]?.path;

 if (!categoryImage) {
  res
   .status(200)
   .send(new ApiResponse(409, null, "thumbnail file is required"));
 }

 // upload them to cloudinary, avatar
 const imageURL = await uploadOnCloudinary(categoryImage);

 if (!imageURL) {
  res
   .status(200)
   .send(new ApiResponse(409, null, "something went wrong with upload image"));
 }

 // create user object - create entry in db
 const category = new Category({
  categoryName,
  image: imageURL.url,
 });

 const categoryCreated = await category.save();

 // check for user creation
 if (!categoryCreated) {
  res
   .status(200)
   .send(
    new ApiResponse(
     400,
     null,
     "Something went wrong while registering the user"
    )
   );
 }

 // return res
 return res
  .status(201)
  .json(new ApiResponse(200, categoryCreated, "category added Successfully"));
});

const GetCategory = asyncHandler(async (req, res) => {
 const category = await Category.find({});

 if (!category.length)
  res.status(200).json(new ApiResponse(400, null, "Category Not Found"));

 return res.status(200).json(new ApiResponse(200, category, "Products Found"));
});

const DeleteCategory = asyncHandler(async (req, res) => {
 const { id } = req.params;
 try {
  const category = await Category.findByIdAndDelete(id);

  if (!category) {
   return res.status(404).json({ message: "Category not found" });
  }

  res.status(200).json({ message: "Category deleted successfully" });
 } catch (error) {
  res.status(500).json({ message: "Error deleting category", error });
 }
});

export { AddCategory, GetCategory, DeleteCategory };
