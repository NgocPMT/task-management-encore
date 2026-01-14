import { Header } from "encore.dev/api";

export interface AuthParams {
  authorization: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  email: string;
  name: string;
}
