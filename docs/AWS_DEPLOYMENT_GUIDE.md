# Sukunix.com - AWS Cloud Deployment & Architecture Guide

This comprehensive guide walks you through deploying the **Sukunix Enterprise Web & Backend System** onto **Amazon Web Services (AWS)**.

---

## 1. System Architecture Overview

```
[ Client Browser: sukunix.com ]
               │
               ▼ (HTTPS / 443)
┌─────────────────────────────────────────────────────────────┐
│                    AWS Cloud Ingress                        │
│   (AWS App Runner / Route 53 / CloudFront / ALB / Nginx)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼ (Port 3000)
┌─────────────────────────────────────────────────────────────┐
│             Sukunix Node.js Express Application             │
│                                                             │
│  • Static Asset Delivery (HTML, CSS, JS, Images, Favicon)   │
│  • Rate Limiting & Helmet Security Armor                    │
│  • GET /api/health (Health Probe for Load Balancers)        │
│  • POST /api/contact (Project Inquiries)                    │
│  • POST /api/book-consultation (Discovery Sessions)         │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MongoDB Database        │ │    Email Dispatch Service  │
│                              │ │                            │
│  • MongoDB Atlas (Cloud)     │ │  • infosukunix@gmail.com   │
│  • or AWS DocumentDB         │ │  • Gmail SMTP / AWS SES    │
│  • Collections:              │ │                            │
│    - inquiries               │ └────────────────────────────┘
│    - bookings                │
└──────────────────────────────┘
```

---

## 2. Option 1: AWS App Runner (Recommended - Easiest & Zero Maintenance)

AWS App Runner is AWS's modern, fully-managed container service. It requires **zero Linux server maintenance**, automatically issues free SSL certificates, provides automated CI/CD from your GitHub repository, and scales down when idle to save costs.

### Step 1: Push Project to GitHub
```bash
git add .
git commit -m "feat: backend Express server, MongoDB integration, and Docker setup"
git push origin main
```

### Step 2: Create App Runner Service
1. Open [AWS App Runner Console](https://console.aws.amazon.com/apprunner).
2. Click **Create an App Runner service**.
3. **Source code repository**:
   - Provider: **GitHub**.
   - Select your repository (`sukunix.com`) and branch (`main`).
   - Deployment trigger: **Automatic** (deploys every time you push code).
4. **Configure build**:
   - Select **Use a configuration file** OR **Configure all settings here**.
   - Runtime: **Nodejs 20** or **Docker** (using the provided `Dockerfile`).
   - Build command: `npm ci --only=production`
   - Start command: `node server.js`
   - Port: `3000`
5. **Environment Variables**:
   Add the following variables in the console:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `3000` | Server listening port |
   | `MONGODB_URI` | `mongodb+srv://user:pass@cluster0.mongodb.net/sukunix?retryWrites=true&w=majority` | MongoDB connection string |
   | `COMPANY_EMAIL` | `infosukunix@gmail.com` | Official company email |
   | `COMPANY_PHONE` | `+91 8866279140` | Official phone number |
   | `COMPANY_WHATSAPP`| `918866279140` | Official WhatsApp handle |
   | `EMAIL_HOST` | `smtp.gmail.com` | SMTP host |
   | `EMAIL_PORT` | `587` | SMTP port |
   | `EMAIL_USER` | `infosukunix@gmail.com` | Gmail account |
   | `EMAIL_PASS` | `your_16_char_app_password` | Gmail App Password |
6. **Health Check**:
   - Path: `/api/health`
   - Interval: `10` seconds
   - Timeout: `5` seconds
7. Click **Create & Deploy**. In ~3-4 minutes, your live URL will be active (e.g. `https://xyz123.ap-south-1.awsapprunner.com`).

### Step 3: Link Custom Domain (`sukunix.com`)
1. In the App Runner console, go to **Custom domains**.
2. Click **Link domain** and enter `sukunix.com` and `www.sukunix.com`.
3. Add the generated CNAME and DNS validation records in your domain registrar (GoDaddy, Namecheap, Route 53, or Cloudflare).
4. AWS will automatically issue and renew a free TLS/SSL certificate.

---

## 3. Option 2: AWS EC2 Virtual Server (Full Control with Nginx & PM2)

If you prefer a dedicated AWS EC2 virtual machine:

### Step 1: Launch EC2 Instance
- **AMI**: Ubuntu Server 24.04 LTS (HVM)
- **Instance Type**: `t3.micro` or `t3.small`
- **Security Group Rules**:
  - Inbound SSH (Port 22) - restricted to your IP
  - Inbound HTTP (Port 80) - `0.0.0.0/0`
  - Inbound HTTPS (Port 443) - `0.0.0.0/0`

### Step 2: Connect & Install Node.js, PM2 & Nginx
```bash
# SSH into your EC2 instance
ssh -i "your-key.pem" ubuntu@ec2-your-instance-ip.compute-1.amazonaws.com

# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Verify installations
node -v
npm -v

# Install PM2 globally
sudo npm install -g pm2
```

### Step 3: Clone Project & Configure `.env`
```bash
# Clone repository
git clone https://github.com/SMuhammad24/sukunix.git /var/www/sukunix
cd /var/www/sukunix

# Install dependencies
npm ci --only=production

# Create production .env
cat << 'EOF' > .env
PORT=3000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sukunix?retryWrites=true&w=majority
COMPANY_NAME=Sukunix Technologies
COMPANY_EMAIL=infosukunix@gmail.com
COMPANY_PHONE=+91 8866279140
COMPANY_WHATSAPP=918866279140
WEBSITE_URL=https://sukunix.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=infosukunix@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="Sukunix Engineering" <infosukunix@gmail.com>
CORS_ORIGIN=https://sukunix.com
EOF

# Start with PM2
pm2 start server.js --name sukunix
pm2 save
pm2 startup
```

### Step 4: Configure Nginx as Reverse Proxy
Create `/etc/nginx/sites-available/sukunix`:
```bash
sudo nano /etc/nginx/sites-available/sukunix
```
Paste:
```nginx
server {
    listen 80;
    server_name sukunix.com www.sukunix.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable configuration:
```bash
sudo ln -s /etc/nginx/sites-available/sukunix /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Install Free SSL with Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d sukunix.com -d www.sukunix.com
```

---

## 4. Option 3: Docker Deployment on AWS EC2
If deploying via Docker on EC2:
```bash
# Install Docker & Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker ubuntu

# Run Sukunix + MongoDB
cd /var/www/sukunix
docker compose up -d --build

# Verify running containers
docker ps
```

---

## 5. MongoDB Database Setup (MongoDB Atlas Cloud)

We recommend using **MongoDB Atlas** (official managed cloud MongoDB hosted on AWS):
1. Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a Free Cluster (e.g. M0 Free Tier in **AWS ap-south-1 Mumbai** or your preferred region).
3. Under **Database Access**, create a user (e.g. `sukunix_admin` with a strong password).
4. Under **Network Access**, click **Add IP Address** -> **Allow Access from Anywhere** (`0.0.0.0/0`) or specify your EC2 Elastic IP.
5. Click **Connect** -> **Drivers (Node.js)** -> copy your connection URI:
   ```
   mongodb+srv://sukunix_admin:<password>@cluster0.abcde.mongodb.net/sukunix?retryWrites=true&w=majority
   ```
6. Set this value as `MONGODB_URI` in `.env` or AWS App Runner Environment Variables.

---

## 6. Email Configuration (`infosukunix@gmail.com`)

### Method A: Gmail App Password (2 Minutes)
1. Log into your Google account for `infosukunix@gmail.com`.
2. Go to **Manage your Google Account** -> **Security**.
3. Enable **2-Step Verification** (if not already enabled).
4. In the search bar at top, type **App Passwords** (or visit `myaccount.google.com/apppasswords`).
5. Create a new App Password named **Sukunix Website Backend**.
6. Google will generate a 16-character password (e.g., `abcd efgh ijkl mnop`).
7. Set this password in `.env`:
   ```env
   EMAIL_USER=infosukunix@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```

### Method B: AWS SES (Simple Email Service)
If sending thousands of emails directly through AWS:
1. Go to **AWS SES Console**.
2. Verify Identity: Add `infosukunix@gmail.com` or verify the `sukunix.com` domain.
3. In SES -> **SMTP Settings**, click **Create SMTP Credentials**.
4. Set credentials in `.env`:
   ```env
   EMAIL_HOST=email-smtp.ap-south-1.amazonaws.com
   EMAIL_PORT=587
   EMAIL_USER=AKIA...your_smtp_username
   EMAIL_PASS=B...your_smtp_password
   ```

---

## 7. Verifying Deployment Health

Once deployed on AWS, verify:
1. **Health Check**:
   ```bash
   curl https://sukunix.com/api/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "database": {
       "type": "MongoDB",
       "connected": true
     },
     "service": "Sukunix Enterprise Web & Cloud Backend",
     "version": "1.0.0"
   }
   ```
2. **Submit Project Inquiry**:
   Fill the consultation form on `https://sukunix.com/#contact` and verify that the lead is recorded in MongoDB and emails arrive in `infosukunix@gmail.com`.
3. **Book Consultation**:
   Click "Book Consultation", select a slot, and verify the meeting is saved in MongoDB and the confirmation WhatsApp button opens `https://wa.me/918866279140`.
