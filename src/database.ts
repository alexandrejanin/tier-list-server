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

class Result<T> {
    readonly success: boolean = false;
    readonly error?: string;
    readonly result?: T;

    public static success<T>(result?: T): Result<T> {
        return {
            success: true,
            result
        };
    }

    public static error<T>(error?: string): Result<T> {
        return {
            success: true,
            error
        };
    }
}


// Pool setup

const pool = new Pool({
    user: dbUser,
    host: dbHost,
    database: dbDatabase,
    password: dbPassword,
    port: dbPort,
});

pool.on('error', (err, client) => {
    console.error("Pooling error:", err);
});


// API functions

export async function setupDatabase() {
    await pool.query(tierListsSchema);
}

export async function createTierList(tierListInfo: TierListInfo): Promise<Result<TierList>> {
    if (!tierListInfo.title || tierListInfo.title.trim().length == 0) {
        return Result.error("Title cannot be empty");
    }

    const tierList = new TierList(tierListInfo);

    const res = await pool.query(
        'INSERT INTO tierlists(id, title, description, imageSource, tiers) VALUES($1, $2, $3, $4, $5) RETURNING *',
        [tierList.id, tierList.title, tierList.description, tierList.imageSource, JSON.stringify(tierList.tiers)],
    );

    if (res.rowCount != 1) {
        console.error(`INSERT query returned ${res.rowCount} rows`);
        console.log(res);
        return Result.error("Error while creating tier list");
    }

    return Result.success(res.rows[0]);
}

export async function getAllTierLists(): Promise<Result<TierList[]>> {
    const res = await pool.query('SELECT * FROM tierlists');

    return Result.success(res.rows);
}

export async function getTierList(id: Id): Promise<Result<TierList>> {
    const res = await pool.query(
        'SELECT * FROM tierlists WHERE id = $1',
        [id],
    );

    if (res.rowCount == 0) {
        return Result.error(`No tier list found with id ${id}`);
    }

    return Result.success(res.rows[0]);
}

export async function updateTierList(id: Id, tierList: TierList): Promise<Result<TierList>> {
    const res = await pool.query(
        'UPDATE tierlists SET title = $2, description = $3, imageSource = $4, tiers = $5 WHERE id = $1 RETURNING *',
        [tierList.id, tierList.title, tierList.description, tierList.imageSource, JSON.stringify(tierList.tiers)]
    );

    if (res.rowCount == 0) {
        return Result.error(`No tier list found with id ${id}`);
    }

    return Result.success(res.rows[0]);
}

export async function deleteTierList(id: Id): Promise<Result<string>> {
    const res = await pool.query(
        'DELETE FROM tierlists WHERE id = $1',
        [id],
    );

    if (res.rowCount == 0) {
        return Result.error(`No tier list found with id ${id}`);
    }

    return Result.success();
}
