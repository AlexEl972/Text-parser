import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
const crypto = require('crypto');

const app = express();
const port = 3000; 

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'POST');
    return res.status(200).json({});
  }
  next();
});

app.listen(port, () => {
    console.log(`Le serveur est à l'écoute sur le port ${port}`);
});

let token: string = ''; 

app.post('/api/token', (req: Request, res: Response) => {
  const { email } = req.body;
  token = generateToken(email);
  res.json({ token });
});

function generateToken(email: string): string {
    const token = crypto.createHash('sha256').update(email).digest('hex');
    return token;
}

