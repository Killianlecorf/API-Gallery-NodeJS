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
exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_Model_1 = require("../models/User.Model");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: 'Authentification requise.' });
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = yield User_Model_1.User.findById(decodedToken.userId);
        if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé.' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(401).json({ error: 'Jeton d\'authentification invalide.' });
    }
});
exports.authenticateUser = authenticateUser;
