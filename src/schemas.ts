export const tierListsSchema = `
    CREATE TABLE IF NOT EXISTS tierlists (
        id          UUID PRIMARY KEY,
        title       VARCHAR(100) NOT NULL,
        description VARCHAR(1000) NULL,
        tiers       JSONB NOT NULL
    );
`;
