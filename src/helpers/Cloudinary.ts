import { Request, Response, NextFunction } from "express";
import cloudinary from "cloudinary";
import { apiResponse } from "../common";
import multer from "multer";
import config from "config";
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary1: any = config.get("cloudinary");


cloudinary.v2.config({
    cloud_name: cloudinary1.name,
    api_key: cloudinary1.api_key,
    api_secret: cloudinary1.api_secret,
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: (req, file) => {
        return {
            folder: req.params.folder_name,
            resource_type: "image",
            allowed_formats: ["jpg", "jpeg", "png", "gif", "bmp"],
            //   folder: req.params.folder_name,
            //   resource_type: file.mimetype.startsWith("video") ? "video" : "image",
            //   allowed_formats: file.mimetype.startsWith("video") ? ["mp4", "mov", "avi"] : file.mimetype.startsWith("image") ? ["jpg", "jpeg", "png", "gif", "bmp"] : null,
        };
    },
});

export const multerUpload: any = multer({
    storage, fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"));
        }
    },
});

export const uploadImage = async (req: Request, res: Response) => {
    try {
        // const imageUrls = [];
        // let files: any = req.files;
        let file: any = req.file;
        // for (let i = 0; i < files.length; i++) {
        //   const file: any = files[i];
        const imageUrl = file.path;
        //   imageUrls.push(imageUrl);
        // }
        return res.status(200).json(await apiResponse(200, "Images Uploaded Successfully", imageUrl, {}));
    } catch (error) {
        console.log("error", error);
        return res.status(500).json(await apiResponse(500, "Internal Server Error", {}, error));
    }
};

export const deleteImage = async (folderName: string, publicId: string) => {
    try {
        const result = (cloudinary as any).uploader.destroy(`${folderName}/${publicId}`);
        return result;
    } catch (error) {
        console.log(error);
        throw new Error('Failed to delete image from Cloudinary');
    }
};
