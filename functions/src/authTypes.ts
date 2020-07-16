interface JwtClaims {
  iss: string;
  sub: string;
  aud: string;
  iat: string;
  exp: string;
  azp: string;
  gty: string;
}

declare namespace Express {
  export interface Request {
    user: JwtClaims;
  }
}
