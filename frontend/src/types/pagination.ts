export type DataWithPagination<T> = {
  data?: T
  pagination?: IPagination
}

export type DataWithPaginationCursor<T> = {
  data?: T[]
  hasNextPage: boolean
}

export type IPagination = {
  total_records?: number
  total_pages?: number
  current_page?: number
  per_page?: number
}
