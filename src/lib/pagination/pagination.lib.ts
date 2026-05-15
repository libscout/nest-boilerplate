/**
 * Pure pagination utilities.
 * No business logic, no framework dependencies, no side effects.
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Normalizes raw pagination input into safe values.
 */
export function normalizePagination(
  page?: number | string,
  limit?: number | string,
): PaginationParams {
  const p = Math.max(1, Number(page) || DEFAULT_PAGE);
  const l = Math.min(MAX_LIMIT, Math.max(1, Number(limit) || DEFAULT_LIMIT));
  return { page: p, limit: l };
}

/**
 * Calculates the SQL OFFSET from page and limit.
 */
export function offset(params: PaginationParams): number {
  return (params.page - 1) * params.limit;
}

/**
 * Builds a PaginatedResult from data and total count.
 */
export function paginate<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / params.limit) || 1;

  return {
    data,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    },
  };
}
