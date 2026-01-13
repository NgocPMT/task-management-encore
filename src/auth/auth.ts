import { api, APIError } from "encore.dev/api";
import { auth } from "./lib/better-auth";
import { SignInSchema, SignUpSchema } from "./auth.schema";

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  session: {
    token: string;
    expiredAt: Date;
  };
}

export const signUp = api(
  { path: "/v1/auth/register", method: "POST", expose: true },
  async (req: unknown): Promise<AuthResponse> => {
    const parsedResult = SignUpSchema.safeParse(req);

    if (!parsedResult.success) {
      throw APIError.invalidArgument(
        `Invalid request: \n${parsedResult.error.issues}`
      );
    }

    const { email, password, name } = parsedResult.data;

    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!result.user || !result.token) {
      throw APIError.internal("Auth service failed to create user");
    }

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      session: {
        token: result.token,
        expiredAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days from now
      },
    };
  }
);

export const signIn = api(
  { path: "/v1/auth/login", method: "POST", expose: true },
  async (req: unknown): Promise<AuthResponse> => {
    const parsedResult = SignInSchema.safeParse(req);

    if (!parsedResult.success) {
      throw APIError.invalidArgument(
        `Invalid request: \n${parsedResult.error.issues}`
      );
    }

    const { email, password } = parsedResult.data;

    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    if (!result.user || !result.token) {
      throw APIError.unauthenticated("Invalid credentials");
    }

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
      },
      session: {
        token: result.token,
        expiredAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days from now
      },
    };
  }
);
