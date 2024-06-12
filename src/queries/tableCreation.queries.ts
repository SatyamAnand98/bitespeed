export const createTable = {
    contact: `CREATE TABLE IF NOT EXISTS Contact (
            id SERIAL PRIMARY KEY,
            phone_number VARCHAR(255),
            email VARCHAR(255),
            linkedId INT,
            linkPrecedence VARCHAR(255),
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deletedAt TIMESTAMP
        );
        `,

    ipAddress: `CREATE TABLE IF NOT EXISTS IpAddress (
            id SERIAL PRIMARY KEY,
            ip_address VARCHAR(255),
            count INT DEFAULT 1,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deletedAt TIMESTAMP
        );
        `,
};
