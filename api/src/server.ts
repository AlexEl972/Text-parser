import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';

const crypto = require('crypto');

const app = express();
const port = 3000;
let token: string = '125d6c977305337a8f9dc708c8eb1d2265113b427f34913d85d15e23ed3c66cc';
const maxWordsPerDay = 80000;
let wordCount = 0;

app.use(bodyParser.text());

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
  res.json({ token });
});

function generateToken(email: string): string {
  const token = crypto.createHash('sha256').update(email).digest('hex');
  return token;
}











const authenticateToken = (req: Request, res: Response, next: any) => {
  const authToken = req.headers.authorization;
  const token = "125d6c977305337a8f9dc708c8eb1d2265113b427f34913d85d15e23ed3c66cc";
  if (authToken === token) {
    next();
  } else {
    res.sendStatus(401);
  }
};

// const limitByToken = rateLimit({
//   windowMs: 24 * 60 * 60 * 1000,
//   max: maxCharactersPerDay,
//   message: "402 Payment Required",
//   handler: function (req, res) {
//     res.status(402).send("Payment Required");
//   },
// });


app.post('/api/justify', authenticateToken, (req: Request, res: Response) => {
  if (req.get('content-type') === 'text/plain') {
    const text = req.body;
    const words = text.split(/\s+/).length;
    wordCount += words;
    if (maxWordsPerDay > wordCount) {
      res.json(wordCount)
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
