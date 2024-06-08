import dotenv from 'dotenv';
import express from 'express';
import connectDatabaseMongo from './src/config/connectDatabase';
import bodyParser from 'body-parser';
import cors from "cors";

const app = express();

dotenv.config()

const port = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(cors())
app.use(express.json())

connectDatabaseMongo()

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});