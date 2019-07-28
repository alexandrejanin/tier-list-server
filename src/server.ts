import * as bodyParser from 'body-parser';
import * as express from 'express';
import {createTierList, deleteTierList, getAllTierLists, getTierList, setupDatabase, updateTierList} from "./database";

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
    response.send('Server status OK');
});

// Get all tier lists
app.get('/tierlists', async (request: express.Request, response: express.Response) => {
    const result = await getAllTierLists();
    result.sendResponse(response);
});

// Create and return new tier list
app.post('/tierlists', async (request: express.Request, response: express.Response) => {
    const result = await createTierList(request.body);
    result.sendResponse(response);
});

// Get tier list by ID
app.get('/tierlists/:id', async (request: express.Request, response: express.Response) => {
    const result = await getTierList(request.params.id);
    result.sendResponse(response);
});

// Update tier list by ID
app.put('tierlists/:id', async (request: express.Request, response: express.Response) => {
    const result = await updateTierList(request.params.id, request.body.tierList);
    result.sendResponse(response);
});

// Delete tier list by ID
app.delete('/tierlists/:id', async (request: express.Request, response: express.Response) => {
    const result = await deleteTierList(request.params.id);
    result.sendResponse(response);
});

setupDatabase()
    .then(() => {
        console.log("Database setup OK");
        app.listen(apiPort, () => {
            console.log("Server listening on port", apiPort);
        });
    })
    .catch(err => console.error("Database setup ERROR:", err));
