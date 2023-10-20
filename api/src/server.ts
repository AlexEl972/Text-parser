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




app.post('/api/token', (req: Request, res: Response) => {
  const { email } = req.body;
  token = generateToken(email);
  app.use(bodyParser.text());
  res.json({ token });
});

function generateToken(email: string): string {
  const temp_token = crypto.createHash('sha256').update(email).digest('hex');
  return temp_token;
}









app.post('/api/test', (req: Request, res: Response) => {
  res.json({ token });
});


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
        res.send({ justifiedText });
      } else {
        res.status(402).send("Payment Required");
      }
    } else {
      res.status(400).send("Bad Request");
    }
});


function justifyText(text: string): string {
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
