import * as bodyParser from 'body-parser';
import * as express from 'express';

import {getAllTierLists} from "./database";

const app = express();

app.use((request: express.Request, response: express.Response, next) => {
    console.log(`${request.method} ${request.path}`);
    next();
});

app.use(bodyParser.json());

app.get('/', (request: express.Request, response: express.Response) => {
    response.send('Hello world!');
});

app.get('/tierlists', (request: express.Request, response: express.Response) => {
    const tierLists = getAllTierLists();

    response
        .set('Content-Type', 'application/json')
        .send(tierLists);
});

app.get('/tierlists/:id', (request: express.Request, response: express.Response) => {
    response.send(`Tier List ${request.params.id}`);
});

app.get('/tierlists/:id/:field', (request: express.Request, response: express.Response) => {
    response.send(`Field ${request.params.field} of tier list ${request.params.id}`);
});

app.listen(3000);
