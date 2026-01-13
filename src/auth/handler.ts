import { Header, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import log from "encore.dev/log";
import { db } from "../database";
import { session, user } from "../schema";
import { eq } from "drizzle-orm";

interface AuthParams {
  authorization: Header<"Authorization">;
}

interface AuthData {
  userID: string;
  email: string;
  name: string;
}

const myAuthHandler = authHandler(
  async (params: AuthParams): Promise<AuthData> => {
    const token = params.authorization.replace("Bearer ", "");

    if (!token) {
      throw APIError.unauthenticated("No token provided");
    }

    try {
      const sessionRows = await db
        .select({
          userId: session.userId,
          expiresAt: session.expiresAt,
        })
        .from(session)
        .where(eq(session.token, token))
        .limit(1);

      const sessionRow = sessionRows[0];

      if (!sessionRow.userId) {
        throw APIError.unauthenticated("Invalid session");
      }

      if (new Date(sessionRow.expiresAt) < new Date()) {
        throw APIError.unauthenticated("Expired session");
      }

      const userRows = await db
        .select({
          id: user.id,
          email: user.email,
          name: user.name,
        })
        .from(user)
        .where(eq(user.id, sessionRow.userId));

      const userRow = userRows[0];

      if (!userRow) {
        throw APIError.unauthenticated("User not found");
      }

      return {
        userID: userRow.id,
        email: userRow.email,
        name: userRow.name,
      };
    } catch (error) {
      log.error(error);
      throw APIError.unauthenticated("Invalid token", error as Error);
    }
  }
);

export const gateway = new Gateway({ authHandler: myAuthHandler });
