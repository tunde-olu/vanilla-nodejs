class FileSystemError extends Error {
	constructor(
		public errno: number,
		public code: 'ENOENT',
		public syscall: string,
		public path: string,
		public message: string
	) {
		super(message);
	}
}

export default FileSystemError;
