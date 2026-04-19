import type { ErrorResponse } from "@/types/api";

export class ApiError extends Error {
  readonly status: number;
  readonly errorResponse: ErrorResponse;

  constructor(status: number, errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.name = "ApiError";
    this.status = status;
    this.errorResponse = errorResponse;
  }
}
