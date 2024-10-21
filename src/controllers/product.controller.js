import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const AddProduct = asyncHandler(async (req, res) => {
 const { title, description, category, price, discountPercentage, stock } =
  req.body;
 // validation - not empty
 if (
  [title, description, category, price, discountPercentage, stock].some(
   (field) => field?.trim() === ""
  )
 ) {
  res.status(200).json(new ApiResponse(409, null, "All fields are required"));
 }

 const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

 if (!thumbnailLocalPath) {
  res
   .status(200)
   .send(new ApiResponse(409, null, "thumbnail file is required"));
 }

 // upload them to cloudinary, avatar
 const thumbnailURL = await uploadOnCloudinary(thumbnailLocalPath);

 if (!thumbnailURL) {
  res
   .status(200)
   .send(new ApiResponse(409, null, "thumbnail file is required"));
 }

 // create user object - create entry in db
 const product = new Product({
  title,
  description,
  category,
  price,
  discountPercentage,
  stock,
  thumbnail: thumbnailURL.url,
 });

 const productCreated = await product.save();

 // check for user creation
 if (!productCreated) {
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
  .json(new ApiResponse(200, productCreated, "Product added Successfully"));
});

const GetProducts = asyncHandler(async (req, res) => {
 const { pageSize, currentPage, category } = req.body;

 let filterData = {};

 if (category) {
  filterData.category = new mongoose.Types.ObjectId(category);
 }

 const products = await Product.aggregate([
  { $match: filterData },
  { $skip: currentPage * pageSize },
  { $limit: pageSize },
 ]);

 const productsCount = await Product.aggregate([
  { $match: {} },
  { $count: "totalProducts" },
 ]);

 console.log(productsCount);

 if (!products.length)
  res
   .status(200)
   .json(new ApiResponse(400, { data: [], count: 0 }, "Products Not Found"));

 return res.status(200).json(
  new ApiResponse(
   200,
   {
    data: products,
    count: productsCount[0].totalProducts,
   },
   "Products Found"
  )
 );
});

const GetProductById = asyncHandler(async (req, res) => {
 const { id } = req.params;
 const product = await Product.aggregate([
  {
   $lookup: {
    from: "categories",
    localField: "category",
    foreignField: "_id",
    as: "category",
   },
  },
  {
   $unwind: { path: "$category" },
  },
 ]);

 if (!product)
  res
   .status(200)
   .json(new ApiResponse(400, { data: [], count: 0 }, "Product Not Found"));

 return res
  .status(200)
  .json(new ApiResponse(200, product[0], "Products Found"));
});

const deleteProduct = asyncHandler(async (req, res) => {
 const { id } = req.params;
 const product = await Product.findByIdAndDelete(id);

 if (!product)
  res.status(200).json(new ApiResponse(400, null, "Product Not Found"));

 return res.status(200).json(new ApiResponse(200, product, "Products Deleted"));
});

export { AddProduct, GetProducts, GetProductById, deleteProduct };
