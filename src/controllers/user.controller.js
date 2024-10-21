import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessTokens = async (userId) => {
 try {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();

  user.accessToken = accessToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken };
 } catch (error) {
  res
   .status(200)
   .json(
    new ApiResponse(
     500,
     null,
     "Something went wrong while generating referesh and access token"
    )
   );
 }
};

const registerUser = asyncHandler(async (req, res) => {
 // get user details from frontend
 const { fullName, email, password, mobileNumber } = req.body;

 // validation - not empty
 if (
  [fullName, email, mobileNumber, password].some(
   (field) => field?.trim() === ""
  )
 ) {
  res.status(200).json(new ApiResponse(409, null, "All fields are required"));
 }

 // check if user already exists:  email
 const existedUser = await User.findOne({ email: email });

 // check for images, check for avatar
 if (existedUser) {
  res
   .status(200)
   .json(new ApiResponse(409, null, "User with email already exists"));
 }

 const avatarLocalPath = req.files?.avatar[0]?.path;

 if (!avatarLocalPath) {
  res.status(200).send(new ApiResponse(409, null, "Avatar file is required"));
 }

 // upload them to cloudinary, avatar
 const avatar = await uploadOnCloudinary(avatarLocalPath);

 if (!avatar) {
  res.status(200).send(new ApiResponse(409, null, "Avatar file is required"));
 }

 // create user object - create entry in db
 const user = new User({
  fullName,
  avatar: avatar.url,
  mobileNumber,
  email,
  password,
 });

 await user.save();

 // remove password and refresh token field from response
 const createdUser = await User.findById(user._id).select("-password ");

 // check for user creation
 if (!createdUser) {
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
  .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
 // req body -> data
 // username or email
 //find the user
 //password check
 //access and referesh token
 //send cookie

 const { email, password } = req.body;

 if (!email) {
  res.status(200).send(new ApiResponse(400, null, "email is required"));
 }

 const user = await User.findOne({ email });

 if (!user) {
  res.status(200).send(new ApiResponse(404, null, "User does not exist"));
 }

 const isPasswordValid = await user.isPasswordCorrect(password);

 if (!isPasswordValid) {
  res.status(200).send(new ApiResponse(401, null, "Invalid user credentials"));
 }

 const { accessToken } = await generateAccessTokens(user._id);

 const loggedInUser = await User.findById(user._id).select("-password");

 const options = {
  httpOnly: true,
  secure: true,
 };

 return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .json(
   new ApiResponse(
    200,
    {
     user: loggedInUser,
     accessToken,
    },
    "User logged In Successfully"
   )
  );
});

const logoutUser = asyncHandler(async (req, res) => {
 await User.findByIdAndUpdate(
  req.user._id,
  {
   $unset: {
    refreshToken: 1, // this removes the field from document
   },
  },
  {
   new: true,
  }
 );

 const options = {
  httpOnly: true,
  secure: true,
 };

 return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
 return res
  .status(200)
  .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const GetAllUsers = asyncHandler(async (req, res) => {
 const users = await User.find({}).select("-password");

 if (!users.length) {
  res.status(200).json(new ApiResponse(409, null, "Users Not Found"));
 }

 return res.status(201).json(new ApiResponse(200, users, "Users Found"));
});

export { registerUser, loginUser, logoutUser, getCurrentUser, GetAllUsers };
