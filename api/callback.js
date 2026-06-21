// GitHub OAuth – odbiór kodu i przekazanie tokenu do panelu CMS (Sveltia/Decap)
export default async function handler(req, res) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  const code = req.query.code;

  function page(status, payload) {
    const msg = `authorization:github:${status}:${JSON.stringify(payload)}`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><html><body>
<script>
  (function () {
    function receive(e) {
      window.opener && window.opener.postMessage(${JSON.stringify(msg)}, e.origin);
      window.removeEventListener('message', receive, false);
    }
    window.addEventListener('message', receive, false);
    window.opener && window.opener.postMessage('authorizing:github', '*');
  })();
</script>
<p>Logowanie zakończone — możesz zamknąć to okno.</p>
</body></html>`);
  }

  if (!clientId || !clientSecret) {
    page('error', { message: 'Brak konfiguracji OAuth (CLIENT_ID/SECRET).' });
    return;
  }
  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await r.json();
    if (data.access_token) {
      page('success', { token: data.access_token, provider: 'github' });
    } else {
      page('error', data);
    }
  } catch (e) {
    page('error', { message: String(e) });
  }
}
