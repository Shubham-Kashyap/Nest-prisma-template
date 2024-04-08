export const paginationMetaData = (totalRecords: number, page: number, size: number): PaginationMetaData => {
    const totalPages = Math.ceil(totalRecords / size);
    return {
        pagination: Boolean(totalPages),
        currentPage: page,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
        totalPages,
        totalRecords
    };
};
