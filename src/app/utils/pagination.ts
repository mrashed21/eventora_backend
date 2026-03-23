interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const calculatePagination = (options: IPaginationOptions) => {
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;

  const skip = (page - 1) * limit;

  const sortBy = options.sortBy || "created_at";
  const sortOrder = options.sortOrder || "desc";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};
