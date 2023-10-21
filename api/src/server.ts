
// importation des dépendances

import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';



// déclarations de variables

const app = express();
let token: string = '';
const maxWordsPerDay: number = 80000;
const maxWordsPerDayPerToken: { [token: string]: number } = {};     // tableau qui associe un token à sa valeur maximale de mots par jour


// pour les requêtes JSON
app.use(express.text()); 
app.use(express.json());


// configuration de l'api (CORS)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '1800');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token,Origin, X-Requested-With, Content, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});



// route pour la création d'un nouveau token

app.post('/api/token', (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  token = generateToken(email);
  res.json({ token });
});

// fonction pour générer un nouveau token à partir d'un email
export function generateToken(email: string): string {
  const temp_token = crypto.createHash('sha256').update(email).digest('hex'); // hashage de l'email pour obtenir un token unique
  return temp_token;
}



// route pour la justification d'un texte passé en paramètre
app.post('/api/justify', (req: Request, res: Response) => {
  const text: string = req.body as string;
  if (req.get('content-type') === 'text/plain') {
    const words: number = text.split(/\s+/).length;
    if (!maxWordsPerDayPerToken[token]) { // si le token n'existe pas, on initialise sa valeur à 0
      maxWordsPerDayPerToken[token] = 0;
    }
    if (maxWordsPerDayPerToken[token] + words <= maxWordsPerDay) {  // vérification pour la limite de 80000 mots par jour
      maxWordsPerDayPerToken[token] += words; // on ajoute à la valeur maximale de mots par jour
      const justifiedText: string = justifyText(text); // appel de la fonction pour justifier le texte
      res.send(justifiedText);
    } else {
      res.status(402).send('Payment Required');
    }
  } else {
    res.status(400).send('Bad Request');
  }
});






// function pour la justification du texte

export function justifyText(text: string): string {
  const maxLength: number = 80; // Longueur maximale autorisée pour une ligne justifiée
  let result: string = ''; 
  let line: string = ''; 
  const words: string[] = text.split(' ');
  for (let word of words) {        // Vérifie si la longueur actuelle de la ligne ajoutée à la longueur du mot actuel est inférieure ou égale à la longueur maximale autorisée
    if (line.length + word.length <= maxLength) {
      
      line += word + ' ';
    } else {       // Si la longueur de la ligne et du mot dépasse la longueur maximale autorisée
      const wordsInLine: string[] = line.trim().split(' ');    // Divise la ligne en mots individuels
      const spaceCount: number = maxLength - line.length + wordsInLine.length - 1;     // Calcule le nombre total d'espaces requis pour justifier la ligne
      const spacesPerGap: number = Math.floor(spaceCount / (wordsInLine.length - 1));       // Calcule le nombre d'espaces requis entre chaque mot
      const extraSpaces: number = spaceCount % (wordsInLine.length - 1);     // Calcule les espaces supplémentaires qui doivent être ajoutés entre certains mots

      let newLine: string = ''; 

      
      for (let i = 0; i < wordsInLine.length - 1; i++) { // Itère à travers chaque mot dans la ligne pour ajouter les espaces appropriés
        const spaces: string = i < extraSpaces ? ' '.repeat(spacesPerGap + 1) : ' '.repeat(spacesPerGap);
        newLine += wordsInLine[i] + spaces;
      }
      newLine += wordsInLine[wordsInLine.length - 1];
      result += newLine + '\n';
      line = word + ' ';
    }
  }

  // Vérifie s'il reste des mots non traités dans la ligne et les ajoute au résultat sans justification supplémentaire
  if (line.length > 0) {
    result += line.trim();
  }
  return result;
}


export default app;
