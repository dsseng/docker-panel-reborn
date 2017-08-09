import express from 'express';
import logger from 'morgan';
import proxy from 'express-http-proxy';

const app = express();

app.use(logger('dev', {
  skip: () => app.get('env') === 'test'
}));

app.get('*', proxy("localhost:8080"));

app.listen(3000, () => { console.log("http://localhost:3000/") });
