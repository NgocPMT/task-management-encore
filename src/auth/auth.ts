import { api } from "encore.dev/api";
import { auth } from "./lib/better-auth";
import log from "encore.dev/log";

interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

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
  async (req: SignUpRequest): Promise<AuthResponse> => {
    const { email, name, password } = req;

    log.info("User signup attempt", { email });

    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    if (!result.user || !result.token) {
      throw new Error("Failed to create user");
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

interface SignInRequest {
  email: string;
  password: string;
}

export const signIn = api(
  { path: "/v1/auth/login", method: "POST", expose: true },
  async (req: SignInRequest): Promise<AuthResponse> => {
    const { email, password } = req;

    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    if (!result.user || !result.token) {
      throw new Error("Invalid credentials");
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
