# Sukunix - Automated Paid Consultation Workflow Guide
*(Zoom Meeting Generation + WhatsApp Instant Notification)*

This document outlines the zero-touch automation architecture for **Sukunix.com** Paid Discovery Consultations. When a client pays the nominal commitment fee (₹499 / $19), this workflow automatically creates an authenticated Zoom meeting and dispatches formatted confirmation messages with calendar invites to both the **Client's WhatsApp & Email** and the **Sukunix Team's WhatsApp**.

---

## Architecture Flow Diagram

```
[Client on sukunix.com]
         │
         ▼
[Step 1: Select Date & Time Slot]
         │
         ▼
[Step 2: Enter WhatsApp & Work Email]
         │
         ▼
[Step 3: Pay Nominal Commitment Fee (Razorpay / Stripe / UPI)]
         │
         ├─── Webhook Triggered (POST JSON)
         │
         ▼
[Automation Engine: Make.com / n8n / Zapier]
         │
         ├─── 1. Zoom API (Server-to-Server OAuth)
         │       └─ POST /v2/users/me/meetings ➔ Generates Zoom Join Link, Meeting ID & Passcode
         │
         ├─── 2. WhatsApp Cloud API / Twilio
         │       ├─ Template Message to Client WhatsApp (with Zoom Link & Time)
         │       └─ Internal Alert to Sukunix Lead Architect WhatsApp
         │
         └─── 3. Google Calendar / ICS Invite
                 └─ Dispatches .ics invite to Client's Work Email
```

---

## 1. Webhook JSON Payload Schema

When a client finishes payment on the website, `assets/js/booking.js` generates the following payload:

```json
{
  "event": "consultation.booked",
  "bookingRef": "SKX-892410",
  "timestamp": "2026-09-16T11:45:00.000Z",
  "amountPaid": "₹499",
  "currency": "INR",
  "status": "PAID_CONFIRMED",
  "client": {
    "name": "Alex Morgan",
    "email": "alex@acmecorp.com",
    "countryCode": "+91",
    "whatsapp": "+91 9876543210",
    "company": "Acme Systems",
    "service": "Enterprise Web / Microservices Architecture"
  },
  "slot": {
    "dateFormatted": "Thu, Sep 18, 2026",
    "time": "11:30 AM",
    "timezone": "Asia/Kolkata (IST)",
    "durationMinutes": 45
  },
  "invoiceCreditNote": "100% of commitment fee (₹499) to be deducted from milestone invoice 01."
}
```

---

## 2. Zoom Server-to-Server OAuth Integration

### Step 1: Create a Zoom App
1. Go to [Zoom App Marketplace](https://marketplace.zoom.us/) and log in as Administrator.
2. Click **Develop** ➔ **Build App** ➔ Choose **Server-to-Server OAuth**.
3. Name your app `Sukunix Booking Engine`.
4. Copy your credentials:
   - `Account ID`
   - `Client ID`
   - `Client Secret`
5. Add the required Scope:
   - `meeting:write:admin`

### Step 2: Request an Access Token (cURL)
```bash
curl -X POST "https://zoom.us/oauth/token?grant_type=account_credentials&account_id=YOUR_ACCOUNT_ID" \
  -H "Authorization: Basic BASE64_ENCODED(CLIENT_ID:CLIENT_SECRET)"
```

### Step 3: Create Meeting Endpoint
```http
POST https://api.zoom.us/v2/users/me/meetings
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json

{
  "topic": "Sukunix Enterprise Architecture Discovery: Alex Morgan",
  "type": 2,
  "start_time": "2026-09-18T11:30:00",
  "duration": 45,
  "timezone": "Asia/Kolkata",
  "agenda": "Enterprise architecture scope, cloud infrastructure review, and team pod allocation.",
  "settings": {
    "host_video": true,
    "participant_video": true,
    "join_before_host": false,
    "mute_upon_entry": true,
    "waiting_room": true
  }
}
```

---

## 3. WhatsApp Cloud API Integration

### Client Confirmation Message Template (`sukunix_consultation_confirmed`)
*Language: English (US)*

```
Hello {{1}},

Your Paid Discovery Architecture Consultation with Sukunix Technologies has been confirmed!

📅 Date & Time: {{2}} ({{3}})
🔗 Zoom Join Link: {{4}}
🆔 Meeting ID: {{5}}
🔑 Passcode: {{6}}

💰 Commitment Deposit: {{7}} (100% credited against your first project invoice).

A calendar invite has also been dispatched to {{8}}.

Best regards,
Sukunix Engineering Pod
https://sukunix.com
```

### Internal Admin WhatsApp Alert
Send instant notification to the Sukunix Founder/Architect phone number:
```
🚨 NEW PAID DISCOVERY BOOKING:
- Client: Alex Morgan (Acme Systems)
- Need: Distributed Microservices
- Slot: Thu, Sep 18 at 11:30 AM IST
- WhatsApp: +91 9876543210
- Email: alex@acmecorp.com
- Zoom Link: https://zoom.us/j/98244108291
```

---

## 4. No-Code Blueprint Setup (Make.com / n8n)

### Option A: Make.com (formerly Integromat)
1. **Trigger Module**: `Webhooks - Custom Webhook`
   - Paste the generated URL into `window.SUKUNIX_BOOKING_WEBHOOK` in `assets/js/booking.js`.
2. **Action Module 1**: `Zoom - Create a Meeting`
   - Map `start_time`, `topic`, and `duration: 45`.
3. **Action Module 2**: `WhatsApp Business Cloud - Send Template Message`
   - Map Client Phone: `{{client.whatsapp}}`.
   - Map Parameters: Name, Date/Time, Zoom Link.
4. **Action Module 3**: `Email (SMTP / Gmail) - Send an Email`
   - Attach the generated `.ics` calendar invitation to `{{client.email}}`.

### Option B: n8n Workflow (Self-Hosted / Open-Source)
- Import standard webhook node ➔ HTTP Request to Zoom API ➔ WhatsApp node.

---

## 5. Front-end Webhook Configuration

To connect live production webhooks without changing code:
Set the following global variable in `index.html` or a custom script before `assets/js/booking.js`:

```html
<script>
  window.SUKUNIX_BOOKING_WEBHOOK = "https://hook.eu1.make.com/your-unique-webhook-id";
</script>
```
When this variable is set, the front-end will automatically transmit live booking payloads to your automation pipeline.
