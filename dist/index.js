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
const app = (0, express_1.default)();
dotenv_1.default.config();
const port = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, connectDatabase_1.default)();
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
