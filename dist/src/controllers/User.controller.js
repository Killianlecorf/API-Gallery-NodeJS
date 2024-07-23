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
exports.logOut = exports.isAuthenticated = exports.deleteUser = exports.getUserLogin = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const User_Model_1 = require("../models/User.Model");
const Picture_Model_1 = __importDefault(require("../models/Picture.Model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// GET /users   
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_Model_1.User.find();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des utilisateurs.' });
    }
});
exports.getAllUsers = getAllUsers;
// GET /users/:id
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const user = yield User_Model_1.User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé.' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue lors de la récupération de l\'utilisateur.' });
    }
});
exports.getUserById = getUserById;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body;
    try {
        const { name, password } = userData;
        const existingUser = yield User_Model_1.User.findOne({ name });
        if (existingUser) {
            return res.status(409).json({ error: 'Cet utilisateur existe déjà.' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = new User_Model_1.User({
            name,
            password: hashedPassword,
            pictures: []
        });
        yield user.save();
        const secretKey = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, secretKey);
        const cookieOptions = {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        };
        res.cookie('token', token, cookieOptions);
        res.json({ user, token });
    }
    catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Une erreur est survenue lors de la création de l\'utilisateur.' });
    }
});
exports.createUser = createUser;
const getUserLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password } = req.body;
    try {
        const user = yield User_Model_1.User.findOne({ name }).select('+password');
        if (!user) {
            return res.status(401).json({ error: 'L\'adresse e-mail est incorrect.' });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'le mot de passe est incorrect.' });
        }
        const secretKey = process.env.JWT_SECRET;
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, secretKey);
        const cookieOptions = {
            httpOnly: true
        };
        res.cookie('token', token, cookieOptions);
        res.json({ user, token });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Une erreur est survenue lors de la connexion.' });
    }
});
exports.getUserLogin = getUserLogin;
// DELETE /users/:id
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield User_Model_1.User.findById(id).populate('pictures').exec();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        yield User_Model_1.User.findByIdAndDelete(id);
        const images = yield Picture_Model_1.default.find({ user: id });
        const deleteFilePromises = images.map(image => {
            const imagePath = path_1.default.join(__dirname, '../../../uploads', path_1.default.basename(image.url));
            console.log('Constructed imagePath:', imagePath);
            console.log('Original image URL:', image.url);
            return new Promise((resolve, reject) => {
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlink(imagePath, (err) => {
                        if (err) {
                            console.error('Error deleting file:', err);
                            reject(err);
                        }
                        else {
                            console.log('File deleted successfully:', imagePath);
                            resolve();
                        }
                    });
                }
                else {
                    console.log('File not found:', imagePath);
                    resolve();
                }
            });
        });
        try {
            yield Promise.all(deleteFilePromises);
            yield Picture_Model_1.default.deleteMany({ user: id });
            res.status(200).json({ message: 'User and images deleted successfully' });
        }
        catch (err) {
            console.error('Error in deleting files:', err);
            res.status(500).json({ error: 'Error deleting files' });
        }
    }
    catch (err) {
        console.error('Error in deleteUser:', err);
        res.status(500).json({ error: err.message });
    }
});
exports.deleteUser = deleteUser;
function isAuthenticated(req, res) {
    try {
        const token = req.cookies.token;
        if (token) {
            return res.status(200).json({ isAuthenticated: true });
        }
        else {
            return res.status(401).json({ isAuthenticated: false, message: 'Non connecté, token non trouvé.' });
        }
    }
    catch (error) {
        console.error('Erreur de vérification:', error);
        return res.status(500).json({ message: 'Une erreur est survenue lors de la vérification de l\'authentification.' });
    }
}
exports.isAuthenticated = isAuthenticated;
function logOut(req, res) {
    try {
        res.clearCookie('token');
        return res.status(200).json({ message: 'Déconnexion réussie.' });
    }
    catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        return res.status(500).json({ message: 'Une erreur est survenue lors de la déconnexion.' });
    }
}
exports.logOut = logOut;
;
