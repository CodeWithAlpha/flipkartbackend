import { Router } from "express";
import {
 AddProduct,
 GetProducts,
 GetProductById,
 deleteProduct,
} from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/create").post(
 upload.fields([
  {
   name: "thumbnail",
   maxCount: 1,
  },
 ]),
 AddProduct
);
router.route("/list").post(GetProducts);
router.route("/:id").get(GetProductById);
router.route("/:id").delete(deleteProduct);

export default router;
