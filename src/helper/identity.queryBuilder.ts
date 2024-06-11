// Path: src/database/index.ts

export class NestedQueryBuilder {
    private query: string;
    private query2: string;
    private query3: string;
    private params: any[];
    private count: number;

    constructor() {
        this.query = "SELECT * FROM Contact WHERE";
        this.query2 = "id IN (SELECT linkedid FROM Contact WHERE";
        this.query3 = "linkedid IN (SELECT id FROM Contact WHERE";
        this.params = [];
        this.count = 1;
    }

    public setEmail(email: string): NestedQueryBuilder {
        if (!email) return this;
        if (this.count > 1) {
            this.query += " OR ";
            this.query2 += " OR ";
            this.query3 += " OR ";
        }
        this.query += ` email = $${this.count}`;
        this.query2 += ` email = $${this.count}`;
        this.query3 += ` email = $${this.count}`;
        this.params.push(email);
        this.count++;
        return this;
    }

    public setPhoneNumber(phoneNumber: string): NestedQueryBuilder {
        if (!phoneNumber) return this;
        if (this.count > 1) {
            this.query += " OR ";
            this.query2 += " OR ";
            this.query3 += " OR ";
        }
        this.query += ` phone_number = $${this.count}`;
        this.query2 += ` phone_number = $${this.count}`;
        this.query3 += ` phone_number = $${this.count}`;
        this.params.push(phoneNumber);
        this.count++;
        return this;
    }

    public build(): { query: string; params: any[] } {
        return {
            query: `${this.query} OR ${this.query2}) OR ${this.query3})`,
            params: this.params,
        };
    }
}
