export const createTable = {
    contact: `CREATE TABLE IF NOT EXISTS Contact (
            id SERIAL PRIMARY KEY,
            phoneNumber VARCHAR(255),
            email VARCHAR(255),
            linkedId INT,
            linkPrecedence VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deletedAt TIMESTAMP
        );
        `,

    user: `CREATE TABLE IF NOT EXISTS Users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255),
            password VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deletedAt TIMESTAMP
        );
        `,
};
