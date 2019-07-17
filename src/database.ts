import uuidv4 = require('uuid/v4');
import {Pool} from 'pg';

import {dbDatabase, dbHost, dbPassword, dbPort, dbUser} from './dbConfig';

import {tierListsSchema} from './schemas';

// DB Types

type Id = string;

interface TierList {
    readonly id: Id;
    readonly title: string;
    readonly description: string;
    readonly tiers: Tier[];
}

function defaultTierList(title: string, description: string): TierList {
    return {
        id: uuidv4(),
        title,
        description,
        tiers: [
            {title: "S", color: "rgb(137,243,255)", items: []},
            {title: "A", color: "rgb(82,255,98)", items: []},
            {title: "B", color: "rgb(229,255,145)", items: []},
            {title: "C", color: "rgb(255,205,99)", items: []},
            {title: "D", color: "rgb(255,183,149)", items: []},
        ]
    };
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
    readonly imageUrl?: string;
}


// API types

interface TierListInfo {
    readonly title: string;
    readonly description?: string;
}


// Pool setup

const pool = Pool({
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

export async function createTierList(tierListInfo: TierListInfo) {
    const tierList = defaultTierList(tierListInfo.title, tierListInfo.description);

    const res = await pool.query(
        'INSERT INTO tierlists(id, title, description, tiers) VALUES($1, $2, $3, $4) RETURNING *',
        [tierList.id, tierList.title, tierList.description, JSON.stringify(tierList.tiers)]
    );

    if (res.rowCount != 1) {
        console.error(`INSERT query returned ${res.rowCount} rows`);
        console.log(res);
        return {
            success: false,
        };
    }

    return {
        success: true,
        tierlist: res.rows[0]
    };

}

export async function getAllTierLists(): Promise<TierList[]> {
    const res = await pool.query('SELECT * FROM tierlists');

    return res.rows;
}

export async function getTierList(id: Id): Promise<TierList> {
    console.log(id);
    const res = await pool.query(
        'SELECT * FROM tierlists WHERE id = $1',
        [id]
    );

    console.log(res);

    return res.rows[0];
}
