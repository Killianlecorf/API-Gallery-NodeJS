"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const connectDatabase_1 = __importDefault(require("./src/config/connectDatabase"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const User_Routes_1 = __importDefault(require("./src/routes/User.Routes"));
const Picture_Routes_1 = __importDefault(require("./src/routes/Picture.Routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
dotenv_1.default.config();
const port = process.env.PORT || 3000;
const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
};
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
(0, connectDatabase_1.default)();
app.use('/api/user', User_Routes_1.default);
app.use('/api/pictures', Picture_Routes_1.default);
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
