export interface Pagination {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
