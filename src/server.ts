import * as bodyParser from 'body-parser';
import * as express from 'express';
import {createTierList, deleteTierList, getAllTierLists, getTierList, setupDatabase} from "./database";

const app = express();

const apiPort = 3000;

// Log all received requests to console
app.use((request, response, next) => {
    console.log(`${request.method} ${request.path}`);
    next();
});

app.use(bodyParser.json());

// Get API status
app.get('/', (request: express.Request, response: express.Response) => {
    response.send('OK');
});

// Get all tier lists
app.get('/tierlists', async (request: express.Request, response: express.Response) => {
    const tierLists = await getAllTierLists();
    response.json(tierLists);
});

// Create and return new tier list
app.post('/tierlists', async (request: express.Request, response: express.Response) => {
    const res = await createTierList(request.body);
    response.json(res);
});

// Get tier list by ID
app.get('/tierlists/:id', async (request: express.Request, response: express.Response) => {
    const res = await getTierList(request.params.id);
    response.json(res);
});

// Delete tier list by ID
app.delete('/tierlists/:id', async (request: express.Request, response: express.Response) => {
    const res = await deleteTierList(request.params.id);
    response.json(res);
});

setupDatabase()
    .then(() => {
        console.log("Database setup OK");
        app.listen(apiPort, () => {
            console.log("Server listening on port", apiPort);
        });
    })
    .catch(err => console.error("Database setup ERROR:", err));
