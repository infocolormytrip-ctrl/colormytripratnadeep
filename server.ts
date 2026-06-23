import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Since we are running in ESM, find __dirname safely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Body parser for enquiry submissions
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route - Capture Enquiry submission and simulate mail drop to Info.colormytrip@gmail.com
  app.post('/api/enquire', (req, res) => {
    const { name, email, phone, destination, travelers, travelDate, message, id } = req.body;
    
    // Beautiful formatted console email simulation log
    console.log('========================================================================');
    console.log('📬 NEW INCOMING ENQUIRY DROPPED TO: Info.colormytrip@gmail.com');
    console.log('========================================================================');
    console.log(`Enquiry ID   : ${id || 'N/A'}`);
    console.log(`Customer Name: ${name}`);
    console.log(`Email Address: ${email}`);
    console.log(`Phone Number : ${phone}`);
    console.log(`Destination  : ${destination}`);
    console.log(`Travelers    : ${travelers} pax`);
    console.log(`Travel Date  : ${travelDate}`);
    console.log(`Custom Note  :`);
    console.log(`"${message}"`);
    console.log('========================================================================');
    console.log('💌 Email Dispatch Status: SUCCESS (Simulated SMTP forward over TLS)');
    console.log('========================================================================');

    return res.status(200).json({
      success: true,
      message: 'Enquiry dropped to Info.colormytrip@gmail.com successfully (Logged on Server Console).',
      payload: { id, name, email, destination }
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // Serve Vite in development / production static build
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ColorMyTrip Server] Running in ${process.env.NODE_ENV || 'development'} mode on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal dev server start error:', error);
});
