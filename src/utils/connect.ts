import { Response } from "express";
import { Pool } from "mysql2/promise";
import HttpCode from "simple-http-status-codes";
import { dbPool } from "./db";
import { ApiError, ApiResponse } from "../interfaces/api";

export const initResponse = async (successCode?: number) => {
    const httpCode: HttpCode = new HttpCode(successCode ?? 200);

    const response: ApiResponse = {
        code: httpCode.getCodeNumber(),
        key: httpCode.getCodeKey()
    };

    const conn: Pool | null = dbPool();

    return {
        httpCode,
        response,
        conn
    };
}

export const finishResponse = (res: Response, httpCode: HttpCode, response: ApiResponse | ApiError) => {
    response.code = httpCode.getCodeNumber();
    
    if ('key' in response) {
        response.key = httpCode.getCodeKey();
    }
    
    res.writeHead(response.code, {"Content-Type": "application/json"});
    res.end(JSON.stringify(response));
}
