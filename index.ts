import dotenv from 'dotenv';
import express from 'express';
import connectDatabaseMongo from './src/config/connectDatabase';
import bodyParser from 'body-parser';
import cors from "cors";
import UserRoute  from './src/routes/User.Routes';
import PictureRoute  from './src/routes/Picture.Routes';
import cookieParser from 'cookie-parser';
import path from 'path';

const app = express();

dotenv.config()

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true 
};

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(bodyParser.json())
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser());

connectDatabaseMongo()

app.use('/api/user', UserRoute);
app.use('/api/pictures', PictureRoute);

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});