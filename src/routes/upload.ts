"use strict";
import { Router } from "express";
import { userJWT } from "../helpers";
import {} from "../helpers";
import * as validation from "../validation";
import { uploadImage } from "../helpers/Cloudinary";
import { multerUpload } from "../helpers/Cloudinary";
const router = Router();
// router.post("/image/:folder_name",validation?.file_type, multerUpload.array("image"), uploadImage);
router.post("/image/:folder_name",validation?.file_type, multerUpload.single("image"), uploadImage);

export const uploadRouter = router;