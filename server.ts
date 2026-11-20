import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);

  const otpStore = new Map<string, { code: string; expiresAt: number }>();

  app.get('/api/health', (_req, res) => {
    res.json({
      name: 'ZAYRO Voice Sanctuary Server',
      status: 'ok',
    });
  });

  app.post('/api/auth/send-otp', (req, res) => {
    const rawPhone = String(req.body?.phone ?? '').trim();
    const digits = rawPhone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      res.status(400).json({ error: 'Please enter a valid mobile phone number.' });
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    otpStore.set(digits, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
    const masked =
      digits.length >= 4
        ? `${rawPhone.slice(0, Math.max(0, rawPhone.length - 4))}••••${digits.slice(-2)}`
        : rawPhone;
    res.json({
      ok: true,
      maskedPhone: masked,
      expiresInSec: 300,
      smsPreviewCode: code,
    });
  });

  app.post('/api/auth/verify-otp', (req, res) => {
    const rawPhone = String(req.body?.phone ?? '').trim();
    const code = String(req.body?.code ?? '').trim();
    const digits = rawPhone.replace(/\D/g, '');
    const record = otpStore.get(digits);
    if (!record) {
      res.status(400).json({ error: 'No OTP found for this phone number. Request a new code.' });
      return;
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(digits);
      res.status(400).json({ error: 'OTP expired. Please request a new code.' });
      return;
    }
    if (record.code !== code) {
      res.status(400).json({ error: 'Invalid OTP code. Please check your SMS and try again.' });
      return;
    }
    otpStore.delete(digits);
    res.json({ ok: true });
  });

  const wss = new WebSocketServer({ server, path: '/ws' });
  const sockets = new Map<string, WebSocket>();

  wss.on('connection', (ws) => {
    const clientId = `usr-${Math.random().toString(36).slice(2, 9)}`;
    sockets.set(clientId, ws);

    ws.send(JSON.stringify({ type: 'welcome', clientId }));

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        if (msg.type === 'room:chat') {
          for (const [id, client] of sockets.entries()) {
            if (id !== clientId && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(msg));
            }
          }
        }
      } catch {
        // Ignore malformed payloads
      }
    });

    ws.on('close', () => {
      sockets.delete(clientId);
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`ZAYRO server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
