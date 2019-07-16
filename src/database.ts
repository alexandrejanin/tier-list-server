import {Client} from 'pg';

type Id = number;

class User {
    private id: Id;
    private username: string;
}

class TierList {
    private id: Id;
    private displayName: string;
    private description: string;
    private tiers: Tier[];

    private constructor(id: number, displayName: string, description: string, tiers: Tier[]) {
        this.id = id;
        this.displayName = displayName;
        this.description = description;
        this.tiers = tiers;
    }

    public static fromRow(row: any): TierList {
        return new TierList(row.id, row.displayName, row.description, []);
    }
}

class Tier {
    private id: Id;
    private displayName: string;
    private description: string;
    private color: string;
    private items: Item[];
}

class Item {
    id: Id;
    displayName: string;
    description: string;
    imageUrl: string;

    constructor(id: number, displayName: string, description: string = null, imageUrl: string = null) {
        this.id = id;
        this.displayName = displayName;
        this.description = description;
        this.imageUrl = imageUrl;
    }
}

const client = Client();

export async function getAllTierLists(): Promise<TierList[]> {
    await client.connect();
    const res = await client.query('SELECT * from tierlists;');

    return res.rows.map(row => TierList.fromRow(row));
}
