class NotFoundError extends Error {
    message;
    code;
    constructor(message, code) {
        super(message);
        this.message = message;
        this.code = code;
    }
}
export default NotFoundError;
