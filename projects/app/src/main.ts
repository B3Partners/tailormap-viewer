import { enableProdMode, ErrorHandler } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { VersionModel } from '../../shared/src/lib/components/about-dialog/version.model';

const SENTRY_DSN: string = (window as any).SENTRY_DSN;

const setupSentryProviders = async () => {
  if (SENTRY_DSN === '@SENTRY_DSN@' || SENTRY_DSN === '') {
    return [];
  }
  const sentry = await import('@sentry/angular-ivy');
  const tracing = await import('@sentry/browser');
  let version: VersionModel | undefined;
  fetch('/version.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('version.json could not be fetched');
      }
      return response.json();
    })
    .then(v => version = v)
    .catch(() => {/* ignore error for now, unable to get version */});
  sentry.init({
    dsn: SENTRY_DSN,
    release: version?.gitInfo?.semverString,
    environment: environment.production ? 'production' : 'development',
    integrations: [
      new tracing.BrowserTracing({
        shouldCreateSpanForRequest: (url) => {
          // Do not create spans for outgoing requests to a `api` endpoint
          return !/\/api\//.test(url);
        },
        routingInstrumentation: sentry.routingInstrumentation,
      }),
    ],
    // Capture 1% of traces in production
    tracesSampleRate: environment.production ? 0.01 : 1.0,
    autoSessionTracking: false,
  });
  return [
    { provide: ErrorHandler, useValue: sentry.createErrorHandler({ showDialog: false }) },
  ];
};

const main = async () => {
  try {
    const sentryProviders = await setupSentryProviders();
    await platformBrowserDynamic(sentryProviders).bootstrapModule(AppModule);
  } catch (error) {
    console.error(error);
  }
};

if (environment.production) {
  enableProdMode();
}

main();
