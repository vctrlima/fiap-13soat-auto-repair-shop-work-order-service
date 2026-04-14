export interface DefaultPageParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface Page<T> {
  content: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
