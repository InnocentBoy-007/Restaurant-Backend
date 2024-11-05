export class CustomError extends Error {
    constructor(message, errorCode) {
        super(message);
        this.errorCode = errorCode
    }
}
