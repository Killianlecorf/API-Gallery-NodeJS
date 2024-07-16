"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const User_controller_1 = require("../controllers/User.controller");
const router = express_1.default.Router();
router.get('/', User_controller_1.getAllUsers);
router.get('/:id', User_controller_1.getUserById);
// Authentification
router.post('/register', User_controller_1.createUser);
router.post('/login', User_controller_1.getUserLogin);
router.delete('/:id', auth_middleware_1.authenticateUser, User_controller_1.deleteUser);
exports.default = router;
