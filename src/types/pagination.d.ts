type PaginationMetaData = {
    currentPage: number;
    nextPage: number | null;
    prevPage: number | null;
    totalPages: number;
    totalRecords: number;
    pagination?: boolean;
};

interface PaginationParams {
    page: number;
    limit: number;
    size: number;
    offset: number;
}
