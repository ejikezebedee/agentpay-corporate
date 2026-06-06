# Examples And Troubleshooting

## Example: Preview The Product

Open these files in a browser:

- `index.html` for the public website.
- `app.html` for the MVP console.

No frontend build step is required.

## Example: Test The Backend Starter

```bash
cd backend-service
npm test
```

Expected result: all Node.js tests pass.

## Example: Start The Backend Starter

```bash
cd backend-service
npm start
```

Then open:

```text
http://localhost:3000/health
http://localhost:3000/api/v1/listings
```

## Example: Use A Different Port

```bash
cd backend-service
PORT=8080 npm start
```

Then open:

```text
http://localhost:8080/health
```

## Example: Verify API Server Target Before Provisioning

Use this only after you have a trusted SSH host-key fingerprint from your server provider or another trusted channel.

```bash
cd backend-service
TARGET_HOST=api.example.com TARGET_PORT=22 EXPECTED_HOST_KEY_SHA256=SHA256:replace-me ./infra/deploy/verify-ssh-target.sh
```

If the fingerprint does not match, stop deployment.

## Troubleshooting

### Website Opens But Styling Is Missing

Confirm `styles.css`, `script.js`, `assets/`, `app.css`, and `app.js` were uploaded with the HTML files.

### Console Route `/app` Does Not Open

Use `app.html` directly unless your hosting rewrite rules map `/app` to `app.html`.

### Backend Tests Fail Because Node Is Missing

Install Node.js 20 or newer, then run `npm test` again inside `backend-service/`.

### Backend Starts But Port Is Busy

Start it on another port:

```bash
PORT=8080 npm start
```

### Webhook Test Rejects Requests

That is expected for unsigned or incorrectly signed requests. Production webhook acceptance must require valid Binance Pay signatures.

### DNS Cutover Fails

Restore the previous DNS record, keep payment movement disabled, and follow `backend-service/docs/DNS_CUTOVER_RUNBOOK.md`.

### Production Secrets Are Needed

Do not write production secrets into package files. Store them on the server or in a secret manager, then create `.env` from `.env.production.example`.

## Support Notes

Before requesting help, collect:

- Hosting provider name.
- Node.js version.
- API deployment path selected: Docker Compose or systemd.
- The failing command and exact error text.
- Whether DNS has been changed.
- Whether payment credentials are live or still disabled.
