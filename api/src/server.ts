import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';


const app = express();
const port = 3000;
let token: string = '';
const maxWordsPerDay = 80000;
const maxWordsPerDayPerToken: { [token: string]: number } = {};
app.use(express.text());
app.use(express.json());


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token,Origin, X-Requested-With, Content, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use((req, res) => {
  res.json({ message: "UPDATE !" }); 
});






app.post('/api/token', (req: Request, res: Response) => {
  const { email } = req.body;
  token = generateToken(email);
  app.use(bodyParser.text());
  res.json({ token });
});

export function generateToken(email: string): string {
  const temp_token = crypto.createHash('sha256').update(email).digest('hex');
  return temp_token;
}








app.post('/api/justify', (req: Request, res: Response) => {
  const text = req.body;
    if (req.get('content-type') === 'text/plain') {
      const words = text.split(/\s+/).length;
      if (!maxWordsPerDayPerToken[token]) {
        maxWordsPerDayPerToken[token] = 0;
      }
      if (maxWordsPerDayPerToken[token] + words <= maxWordsPerDay) {
        maxWordsPerDayPerToken[token] += words;
        const justifiedText = justifyText(text);
        res.send(justifiedText);
      } else {
        res.status(402).send("Payment Required");
      }
    } else {
      res.status(400).send("Bad Request");
    }
});


export function justifyText(text: string): string {
  const maxLength = 80;
  let result: string = '';
  let line: string = '';
  const words = text.split(' ');
  for (let word of words) {
    if (line.length + word.length <= maxLength) {
      line += word + ' ';
    } else {
      const wordsInLine = line.trim().split(' ');
      const spaceCount = maxLength - line.length + wordsInLine.length - 1;
      const spacesPerGap = Math.floor(spaceCount / (wordsInLine.length - 1));
      const extraSpaces = spaceCount % (wordsInLine.length - 1);

      let newLine = '';
      for (let i = 0; i < wordsInLine.length - 1; i++) {
        const spaces = i < extraSpaces ? spacesPerGap + 1 : spacesPerGap;
        newLine += wordsInLine[i] + ' '.repeat(spaces);
      }
      newLine += wordsInLine[wordsInLine.length - 1];
      result += newLine + '\n';
      line = word + ' ';
    }
  }
  if (line.length > 0) {
    result += line.trim();
  }
  return result;
}


module.exports = app;