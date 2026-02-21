export interface BaseRepository<T> {
  create(data: Omit<T, 'id'>): Promise<T>
  findById(id: string): Promise<T | null>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<void>
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface PaginationOptions {
  page?: number
  limit?: number
}
