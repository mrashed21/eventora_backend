export const buildSearchConditions = (
  search_term: string,
  fields: string[],
) => {
  if (!search_term) return {};

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: search_term,
        mode: "insensitive",
      },
    })),
  };
};

export const buildEventSearch = (search_term?: string) => {
  if (!search_term?.trim()) return {};

  const term = search_term.trim().toLowerCase();

  const orConditions: any[] = [
    {
      event_title: {
        contains: search_term.trim(),
        mode: "insensitive",
      },
    },
    {
      event_description: {
        contains: search_term.trim(),
        mode: "insensitive",
      },
    },
    {
      event_venue: {
        contains: search_term.trim(),
        mode: "insensitive",
      },
    },

    // category title search
    {
      category: {
        is: {
          category_title: {
            contains: search_term.trim(),
            mode: "insensitive",
          },
        },
      },
    },
  ];

  if (term === "public" || term === "private") {
    orConditions.push({
      category: {
        is: {
          category_type: term,
        },
      },
    });
  }

  // free search
  if (term === "free") {
    orConditions.push({
      category: {
        is: {
          is_paid: false,
        },
      },
    });
  }

  // paid search
  if (term === "paid") {
    orConditions.push({
      category: {
        is: {
          is_paid: true,
        },
      },
    });
  }

  return {
    OR: orConditions,
  };
};
