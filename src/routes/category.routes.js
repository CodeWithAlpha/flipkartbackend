import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
 AddCategory,
 DeleteCategory,
 GetCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.route("/create").post(
 upload.fields([
  {
   name: "image",
   maxCount: 1,
  },
 ]),
 AddCategory
);
router.route("/list").get(GetCategory);
router.route("/:id").delete(DeleteCategory);

export default router;
