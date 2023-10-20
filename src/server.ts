import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
const crypto = require('crypto');

const app = express();
const port = 3000; 

app.use(bodyParser.json());

let token: string = ''; 


app.post('/api/token', (req: Request, res: Response) => {
  const { email } = req.body;
  token = generateToken(email);
  res.send({ token });
});

function generateToken(email: string): string {
    const token = crypto.createHash('sha256').update(email).digest('hex');
    return token;
  }