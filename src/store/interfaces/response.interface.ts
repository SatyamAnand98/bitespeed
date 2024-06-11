// Path: src/store/interfaces/response.interface.ts
export interface IResponse {
    data: any;
    status: number;
    message: string;
    meta: {
        error: boolean;
        message: string;
    };
}
