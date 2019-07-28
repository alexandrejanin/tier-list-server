import * as express from 'express';
import * as uuidv4 from 'uuid/v4';
import {Pool} from 'pg';

import {dbDatabase, dbHost, dbPassword, dbPort, dbUser} from './dbConfig';

import {tierListsSchema} from './schemas';


// DB Types

type Id = string;

class TierList {
    readonly id: Id;
    readonly title: string;
    readonly description?: string;
    readonly imageSource?: string;
    readonly tiers: Tier[];

    constructor({title, description, imageSource}: TierListInfo) {
        this.id = uuidv4();
        this.title = title.trim();
        this.description = description;
        this.imageSource = imageSource;
        this.tiers = [
            {title: "S", color: "#ff7e7f", items: []},
            {title: "A", color: "#ffbf81", items: []},
            {title: "B", color: "#ffff80", items: []},
            {title: "C", color: "#80ff80", items: []},
            {title: "D", color: "#7fbfff", items: []},
        ];
    }
}

interface Tier {
    readonly title: string;
    readonly description?: string;
    readonly color: string;
    readonly items: Item[];
}

interface Item {
    readonly title: string;
    readonly description?: string;
    readonly imageSource?: string;
}


// API types

interface TierListInfo {
    readonly title: string;
    readonly description?: string;
    readonly imageSource?: string;
}

class Success<T> {
    readonly statusCode: number;
    readonly result?: T;

    constructor(statusCode: number, result?: T) {
        this.statusCode = statusCode;
        this.result = result;
    }

    sendResponse(response: express.Response): express.Response {
        const body: Record<string, any> = {success: true};
        if (this.result)
            body.result = this.result;

        return response
            .status(this.statusCode)
            .json(body);
    }
}

class Error {
    readonly statusCode: number;
    readonly error?: string;

    constructor(statusCode: number, error?: string) {
        this.statusCode = statusCode;
        this.error = error;
    }

    sendResponse(response: express.Response): express.Response {
        const body: Record<string, any> = {success: false};
        if (this.error)
            body.error = this.error;

        return response
            .status(this.statusCode)
            .json(body);
    }
}

type Result<T> = Success<T> | Error;


// Pool setup

const pool = new Pool({
    user: dbUser,
    host: dbHost,
    database: dbDatabase,
    password: dbPassword,
    port: dbPort,
});


// API functions

export async function setupDatabase() {
    await pool.query(tierListsSchema);
}

export async function createTierList(tierListInfo: TierListInfo): Promise<Result<TierList>> {
    if (!tierListInfo.title || tierListInfo.title.trim().length == 0) {
        return new Error(400, "Title cannot be empty");
    }

    let tierList = new TierList(tierListInfo);

    return pool
        .query(
            'INSERT INTO tierlists(id, title, description, imageSource, tiers) VALUES($1, $2, $3, $4, $5) RETURNING *',
            [tierList.id, tierList.title, tierList.description, tierList.imageSource, JSON.stringify(tierList.tiers)],
        )
        .then(res =>
            res.rowCount > 0
                ? new Success(201, res.rows[0])
                : new Error(500, "Database error")
        )
        .catch(err => new Error(500, err.toString()));
}

export async function getAllTierLists(): Promise<Result<TierList[]>> {
    return pool
        .query(
            'SELECT * FROM tierlists',
        )
        .then(res => new Success(200, res.rows))
        .catch(err => new Error(500, err.toString()));
}

export async function getTierList(id: Id): Promise<Result<TierList>> {
    return pool
        .query(
            'SELECT * FROM tierlists WHERE id = $1',
            [id],
        )
        .then(res => res.rowCount > 0
            ? new Success(200, res.rows[0])
            : new Error(404, `No tier list found with id ${id}`)
        )
        .catch(err => new Error(500, err.toString()));
}

export async function updateTierList(id: Id, tierList: TierList): Promise<Result<TierList>> {
    return pool
        .query(
            'UPDATE tierlists SET title = $2, description = $3, imageSource = $4, tiers = $5 WHERE id = $1 RETURNING *',
            [tierList.id, tierList.title, tierList.description, tierList.imageSource, JSON.stringify(tierList.tiers)]
        )
        .then(res => res.rowCount > 0
            ? new Success(200, res.rows[0])
            : new Error(404, `No tier list found with id ${id}`)
        )
        .catch(err => new Error(500, err.toString()));
}

export async function deleteTierList(id: Id): Promise<Result<string>> {
    return pool
        .query(
            'DELETE FROM tierlists WHERE id = $1',
            [id],
        )
        .then(res => res.rowCount > 0
            ? new Success(204)
            : new Error(404, `No tier list found with id ${id}`)
        )
        .catch(err => new Error(500, err.toString()));
}
