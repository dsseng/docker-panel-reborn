import express from 'express';
import logger from 'morgan';

const app = express();

app.use(logger('dev', {
  skip: () => app.get('env') === 'test'
}));

app.use(express.static('frontend/dist'));

app.listen(3000, () => { console.log("http://localhost:3000/") });

