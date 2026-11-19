import { defineConfig } from 'astro/config';

const deployment = process.env.CF_PAGES_URL ? new URL(process.env.CF_PAGES_URL) : undefined;

// Pages exposes a deployment-specific URL. Use the project's stable domain for metadata.
if (deployment?.hostname.endsWith('.pages.dev')) {
  deployment.hostname = deployment.hostname.split('.').slice(-3).join('.');
}

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || deployment?.origin,
  devToolbar: { enabled: false },
});
