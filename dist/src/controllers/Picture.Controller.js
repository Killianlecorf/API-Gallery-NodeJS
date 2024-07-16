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
exports.deleteImage = exports.getUserImages = exports.getAllImages = exports.uploadImage = exports.uploadImageMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const Picture_Model_1 = __importDefault(require("../models/Picture.Model"));
const User_Model_1 = require("../models/User.Model");
// Configuration de multer pour l'upload d'image
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
    const { id } = req.body;
    const file = req.file;
    try {
        const user = yield User_Model_1.User.findById(id).exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const image = new Picture_Model_1.default({
            url: `/uploads/${file.filename}`,
            user: id
        });
        yield image.save();
        user.pictures.push(image._id);
        yield user.save();
        res.status(201).json({ message: 'Image uploaded successfully', url: image.url });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.uploadImage = uploadImage;
const getAllImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const images = yield Picture_Model_1.default.find().exec();
        res.status(200).json(images);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getAllImages = getAllImages;
// Lister les images d'un utilisateur, triées par date et séparées par mois
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
        // Supprimer le fichier physique
        // const imagePath = path.join(__dirname, '../uploads', path.basename(image.url));
        // fs.unlink(imagePath, (err) => {
        //   if (err) {
        //     console.error('Error deleting file:', err);
        //   }
        // });
        yield User_Model_1.User.updateOne({ _id: image.user }, { $pull: { pictures: image._id } });
        res.status(200).json({ message: 'Image deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.deleteImage = deleteImage;
