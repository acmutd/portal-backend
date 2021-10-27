import * as Sentry from "@sentry/node";
import { computeCollectionTotals } from "./functions/totals";
import { environment } from "./environment";

if (environment.SENTRY_DNS) {
  Sentry.init({
    dsn: environment.SENTRY_DNS,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  });
}

computeCollectionTotals();
