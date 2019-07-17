import * as bodyParser from 'body-parser';
import * as express from 'express';
import {createTierList, getAllTierLists, getTierList, setupDatabase} from "./database";

const app = express();

const apiPort = 3000;

app.use((request, response, next) => {
    console.log(`${request.method} ${request.path}`);
    next();
});

app.use(bodyParser.json());

app.get('/', (request, response) => {
    response.send('Hello world!');
});

app.get('/tierlists', async (request, response) => {
    const tierLists = await getAllTierLists();

    response.json(tierLists);
});

app.post('/tierlists', async (request, response) => {
    const res = await createTierList(request.body);
    response.json(res);
});

app.get('/tierlists/:id', async (request, response) => {
    const res = await getTierList(request.params.id);
    response.json(res);
});

setupDatabase()
    .then(() => {
        console.log("Database setup OK");
        app.listen(apiPort);
        console.log("Server listening on port", apiPort);
    })
    .catch(err => console.error("Database setup ERROR:", err));
