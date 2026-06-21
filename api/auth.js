// GitHub OAuth – start logowania dla panelu /admin (Sveltia/Decap CMS)
export default function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('Brak OAUTH_GITHUB_CLIENT_ID w zmiennych środowiskowych.');
    return;
  }
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const redirectUri = `https://${host}/api/callback`;
  const url =
    'https://github.com/login/oauth/authorize' +
    `?client_id=${encodeURIComponent(clientId)}` +
    '&scope=repo' +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.writeHead(302, { Location: url });
  res.end();
}
