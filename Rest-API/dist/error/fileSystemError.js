class FileSystemError extends Error {
    message;
    code;
    syscall;
    path;
    errno;
    constructor(message, code, syscall, path, errno) {
        super(message);
        this.message = message;
        this.code = code;
        this.syscall = syscall;
        this.path = path;
        this.errno = errno;
    }
}
export default FileSystemError;
