// Path: src/database/index.ts
class IdentityQueryBuilder {
    private query: string;
    private params: any[];

    constructor() {
        this.query = "SELECT * FROM Contact WHERE ";
        this.params = [];
    }

    public setEmail(email: string): IdentityQueryBuilder {
        if (email === null || email === undefined || email === "") return this;
        this.query += "email = $1";
        this.params.push(email);
        return this;
    }

    public setPhoneNumber(phoneNumber: string): IdentityQueryBuilder {
        if (
            phoneNumber === null ||
            phoneNumber === undefined ||
            phoneNumber === ""
        )
            return this;
        this.query += "phoneNumber = $1";
        this.params.push(phoneNumber);
        return this;
    }

    public build(): { query: string; params: any[] } {
        return { query: this.query, params: this.params };
    }
}

export const identityQueryBuilder = new IdentityQueryBuilder();
