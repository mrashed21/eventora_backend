export interface Register_payload {
  user_name: string;
  user_email: string;
  user_password: string;
}

export interface IChangePasswordPayload {
  current_password: string;
  new_password: string;
}
