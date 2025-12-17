// Sentry browser monitoring (replace with your DSN)
Sentry = window.Sentry = {
  captureException: function (err) {
    if (window._sentryDSN) {
      fetch('https://o123456.ingest.sentry.io/api/123456/envelope/', {
        method: 'POST',
        body: JSON.stringify({ error: err.message || err.toString() })
      });
    } else {
      console.error('Sentry:', err);
    }
  }
};
// To enable, set window._sentryDSN = 'your-dsn' in the browser or inject via server
