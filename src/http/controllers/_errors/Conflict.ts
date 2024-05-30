import { ApiError } from "./ApiError";

export class ConflictError extends ApiError {
    constructor(message: string){
        super(message, 409)
    }
}