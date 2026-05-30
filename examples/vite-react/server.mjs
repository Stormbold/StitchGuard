import { createServer } from 'node:http';

const port = 5173;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vite React Example</title>
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #f8f6fa; }
    #root { padding: 24px; }
    .card { background: white; border-radius: 16px; padding: 24px; }
    button { background: #d184a1; color: white; border: none; padding: 12px 24px; border-radius: 12px; }
  </style>
</head>
<body>
  <div id="root">
    <div class="card">
      <h1>Vite React Example</h1>
      <p>Minimal example for StitchGuard check workflow.</p>
      <button>Action</button>
    </div>
  </div>
</body>
</html>`;

createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}).listen(port, () => {
  console.log(`Vite example running at http://localhost:${port}`);
});
