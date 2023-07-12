class FileSystemError extends Error {
	constructor(
		public message: string,
		public code?: 'ENOENT' | string,
		public syscall?: string,
		public path?: string,
		public errno?: number
	) {
		super(message);
	}
}

export default FileSystemError;
