export type CreateReviewPayload = {
  rating: number;
  comment?: string;
  eventId: string;
};

export type UpdateReviewPayload = {
  rating?: number;
  comment?: string;
};
