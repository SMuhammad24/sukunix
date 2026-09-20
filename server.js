const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('./src/config');
const { connectDB } = require('./src/config/db');
const apiRoutes = require('./src/routes/api');

const app = express();

// Trust proxy for AWS Application Load Balancers / Reverse Proxies
app.set('trust proxy', 1);

// Security Headers (Helmet) with relaxed CSP for font/script CDNs
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://checkout.razorpay.com',
          'https://fonts.googleapis.com'
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com'
        ],
        fontSrc: [
          "'self'",
          'https://fonts.gstatic.com',
          'data:'
        ],
        imgSrc: [
          "'self'",
          'data:',
          'https://*.razorpay.com',
          'https://images.unsplash.com',
          'https://sukunix.com'
        ],
        frameSrc: [
          "'self'",
          'https://api.razorpay.com',
          'https://checkout.razorpay.com'
        ],
        connectSrc: [
          "'self'",
          'https://*.razorpay.com',
          'https://api.razorpay.com'
        ]
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

// CORS
app.use(cors({ origin: config.corsOrigin }));

// JSON & URL-Encoded body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Global XSS Sanitization Middleware (Strips malicious scripts from body, query & params)
const { xssSanitizer } = require('./src/middleware/xssSanitizer');
app.use(xssSanitizer);

// Rate Limiter for API protection on AWS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again in a few minutes.'
  }
});
app.use('/api/', apiLimiter);

const adminRoutes = require('./src/routes/admin');

// Brute-force protection for Admin Login
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Max 15 attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many administrative login attempts. Please wait 15 minutes before trying again.'
  }
});
app.use('/api/admin/login', adminAuthLimiter);

// Mount API routes
app.use('/api/admin', adminRoutes);
app.use('/api', apiRoutes);

// Serve static frontend files (assets, favicons, site.webmanifest)
app.use(express.static(path.join(__dirname), {
  maxAge: config.nodeEnv === 'production' ? '1d' : '0'
}));

// Frontend Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/case-studies', (req, res) => {
  res.sendFile(path.join(__dirname, 'case-studies.html'));
});

app.get('/calculator', (req, res) => {
  res.sendFile(path.join(__dirname, 'calculator.html'));
});

// Admin Panel Executive Dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Fallback 404 handler for unmatched /api routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

// Start Server & Connect Database
async function bootstrap() {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`🚀 Sukunix Server running at: http://localhost:${config.port}`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    console.log(`📞 Company Phone: ${config.company.phone}`);
    console.log(`✉️  Company Email: ${config.company.email}`);
    console.log(`🏥 Health Check: http://localhost:${config.port}/api/health`);
    console.log('====================================================');
  });

  // Graceful shutdown handling for AWS ECS / EC2 SIGTERM
  function gracefulShutdown(signal) {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
