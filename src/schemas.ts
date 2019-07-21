export const tierListsSchema = `
    CREATE TABLE IF NOT EXISTS tierlists
    (
        id          UUID PRIMARY KEY,
        title       VARCHAR(50) NOT NULL,
        description TEXT        NULL,
        imageSource TEXT        NULL,
        tiers       JSONB       NOT NULL
    );
`;
