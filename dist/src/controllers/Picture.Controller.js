"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = exports.getUserImages = exports.toggleImageVisibility = exports.getPublicImages = exports.uploadImage = exports.uploadImageMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const mongoose_1 = require("mongoose");
const Picture_Model_1 = __importDefault(require("../models/Picture.Model"));
const User_Model_1 = require("../models/User.Model");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
exports.uploadImageMiddleware = upload.single('image');
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const file = req.file;
    try {
        const user = yield User_Model_1.User.findById(id).exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const image = {
            url: `uploads/${file.filename}`,
            user: new mongoose_1.Types.ObjectId(id)
        };
        const newImage = new Picture_Model_1.default(image);
        yield newImage.save();
        user.pictures.push(newImage._id);
        yield user.save();
        res.status(201).json({ message: 'Image uploaded successfully', url: newImage.url });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.uploadImage = uploadImage;
const getPublicImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = yield Picture_Model_1.default.find({ public: true }).sort({ uploadDate: 1 }).exec();
        const groupedImages = images.reduce((acc, image) => {
            const monthKey = `${image.uploadDate.getFullYear()}-${String(image.uploadDate.getMonth() + 1).padStart(2, '0')}`;
            if (!acc[monthKey]) {
                acc[monthKey] = [];
            }
            acc[monthKey].push(image);
            return acc;
        }, {});
        res.status(200).json(groupedImages);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getPublicImages = getPublicImages;
const toggleImageVisibility = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { imageId } = req.params;
        const image = yield Picture_Model_1.default.findById(imageId);
        if (!image) {
            return res.status(404).json({ error: 'Image not found' });
        }
        image.public = !image.public;
        yield image.save();
        res.status(200).json({
            message: `Image visibility updated to ${image.public ? 'public' : 'private'}`,
            image
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.toggleImageVisibility = toggleImageVisibility;
const getUserImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield User_Model_1.User.findById(id).populate('pictures').exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const images = user.pictures;
        const groupedImages = images.reduce((acc, image) => {
            const monthYear = image.uploadDate.toISOString().substring(0, 7);
            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(image);
            return acc;
        }, {});
        res.status(200).json(groupedImages);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getUserImages = getUserImages;
const deleteImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const image = yield Picture_Model_1.default.findByIdAndDelete(id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }
        yield User_Model_1.User.updateOne({ _id: image.user }, { $pull: { pictures: image._id } });
        const imagePath = path_1.default.resolve(__dirname, '../../../uploads', path_1.default.basename(image.url));
        console.log('Attempting to delete file at path:', imagePath);
        if (fs_1.default.existsSync(imagePath)) {
            fs_1.default.unlink(imagePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
                else {
                    console.log('File deleted successfully:', imagePath);
                }
            });
        }
        else {
            console.log('File not found:', imagePath);
        }
        return res.status(200).json({ message: 'Image deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.deleteImage = deleteImage;
