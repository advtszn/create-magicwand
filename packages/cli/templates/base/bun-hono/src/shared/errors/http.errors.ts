export class AppError extends Error {
	constructor(
		message: string,
		public readonly statusCode: number,
	) {
		super(message);
		this.name = new.target.name;
	}
}

export class BadRequestError extends AppError {
	constructor(message: string) {
		super(message, 400);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Authentication required") {
		super(message, 401);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string) {
		super(message, 404);
	}
}

export class UpstreamError extends AppError {
	constructor(message = "Upstream service failed") {
		super(message, 502);
	}
}

export class InternalServerError extends AppError {
	constructor(message = "Internal server error") {
		super(message, 500);
	}
}
