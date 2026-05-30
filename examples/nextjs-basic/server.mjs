import { createServer } from 'node:http';

const port = 3000;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>StitchGuard Example</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: #f8f6fa; color: #1e1e23; }
    .header { padding: 18px 16px; background: #fff; font-weight: 600; }
    .card {
      margin: 102px 24px 0;
      padding: 24px;
      background: #fff;
      border-radius: 16px;
      min-height: 220px;
    }
    .card h1 { font-size: 20px; margin-bottom: 12px; }
    .card p { color: #787882; font-size: 14px; margin-bottom: 24px; }
    .cta {
      display: inline-block;
      background: #d184a1;
      color: #fff;
      padding: 12px 24px;
      border-radius: 12px;
      width: 132px;
      text-align: center;
      margin-top: 16px;
    }
    .nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 72px;
      background: #fff;
      border-top: 1px solid #e6e6eb;
      display: flex;
      justify-content: space-around;
      align-items: center;
    }
    .dot { width: 40px; height: 6px; border-radius: 3px; background: #b4b4be; }
    .dot.active { background: #d184a1; }
  </style>
</head>
<body>
  <div class="header">Ovalina</div>
  <div class="card">
    <h1>Welcome back</h1>
    <p>Track your wellness journey with gentle daily insights.</p>
    <div class="cta">Get Started</div>
  </div>
  <nav class="nav">
    <div class="dot active"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </nav>
</body>
</html>`;

createServer(async (_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}).listen(port, () => {
  console.log(`Example app running at http://localhost:${port}`);
});
