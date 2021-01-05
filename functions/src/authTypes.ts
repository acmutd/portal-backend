interface JwtClaims {
  email?: string;
  custom?: Record<string, unknown>;
  iss: number;
  sub: string;
  aud: string;
  nbf?: number;
  iat: number;
  exp: string;
  azp?: string;
  gty?: string;
}

declare namespace Express {
  export interface Request {
    user: JwtClaims;
  }
}
