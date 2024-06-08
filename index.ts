import dotenv from 'dotenv';
import express, { Request, Response } from 'express';


const app = express();

dotenv.config()

const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, world!');
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});