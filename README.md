
# VIT Lost & Found Portal

A full-stack campus lost-and-found platform designed specifically for the **VIT Vellore student community**.

The platform provides a structured alternative to scattered WhatsApp groups by allowing students to report lost and found items, search campus listings, verify ownership privately, and coordinate item recovery without publicly exposing personal contact information.

---

## ✨ Features

### 🔐 Student Authentication

* VIT student email authentication
* Secure password hashing using bcrypt
* JWT-based authentication
* OTP verification for login
* Gmail SMTP integration for OTP delivery
* Protected API routes

### 📍 VIT Campus Locations

Item reports are restricted to predefined VIT campus locations, including:

**Academic Blocks**

* SJT
* TT
* PRP
* SMV
* MB
* GDN
* CDMM

**Hostels**

* MH-A to MH-T
* LH-A to LH-J

**Other Locations**

* Gazebo
* Food Mall
* DC
* Central Library
* Sports Complex

### 🏷️ Item Categories

The platform currently supports:

* ID Cards
* Room Keys
* Calculators
* Lab Equipment
* Earphones
* Wallets

### 🔎 Separate Lost & Found Feeds

Students can browse:

* Lost Items
* Found Items

Each listing provides relevant information such as:

* Item title
* Description
* Category
* Campus location
* Date
* Current status

### 🛡️ Privacy Protection

Public listings do **not expose the reporter's**:

* Registration number
* Email address
* Phone number
* Personal contact information

This helps prevent spam and unwanted contact.

### ✅ Ownership Verification

Found-item recovery uses a private verification workflow.

The finder can create custom verification questions such as:

> What name and branch are written on the ID card?

A claimant must answer the verification questions before their claim can be reviewed.

The finder can privately:

* View claims
* Review submitted answers
* Approve claims
* Reject claims

The claimant never receives the finder's private identity information.

### 📦 Item Lifecycle

Items can move through different states:

```text
ACTIVE
  ↓
Claim submitted
  ↓
Claim reviewed
  ↓
APPROVED
  ↓
RESOLVED
```

Approved recoveries are removed from the active campus listings.

### 🎨 Modern Responsive UI

The frontend includes:

* Dark modern interface
* Responsive layouts
* Glass-inspired surfaces
* Smooth animations
* Hover states
* Loading states
* Empty states
* Success/error feedback
* Responsive mobile design
* Accessible focus states

---

# 🏗️ Tech Stack

## Frontend

* React
* Vite
* React Router
* JavaScript / JSX
* CSS

## Backend

* Node.js
* Express.js
* JWT
* bcryptjs
* Nodemailer

## Database

* SQLite
* better-sqlite3

## Development

* Git
* GitHub
* VS Code
* Postman / Swagger-compatible API testing

---

# 📁 Project Structure

```text
VIT-Lost-and-Found-Portal/
│
├── src/
│   ├── components/
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── FoundItems.jsx
│   │   └── FoundItemDetails.jsx
│   │
│   ├── utils/
│   │   └── api.js
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── server/
│   ├── database.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have installed:

* Node.js
* npm
* Git

Check your installation:

```bash
node --version
npm --version
git --version
```

---

# ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/riteshneware0707-creator/VIT-Lost-and-Found-Portal.git
```

Move into the project:

```bash
cd VIT-Lost-and-Found-Portal
```

---

# 🖥️ Frontend Setup

Install frontend dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

---

# 🗄️ Backend Setup

Open another terminal and move into the backend:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Create a file named:

```text
.env
```

inside the `server` directory.

Add:

```env
PORT=5000

JWT_SECRET=your_secure_jwt_secret

SMTP_EMAIL=yourgmail@gmail.com
SMTP_APP_PASSWORD=your_gmail_app_password
```

---

# 📧 Gmail OTP Configuration

The application uses Gmail SMTP to send login OTPs.

You should **not use your normal Gmail password**.

Instead:

1. Enable Google 2-Step Verification.
2. Create a Google App Password.
3. Use the generated App Password as:

```env
SMTP_APP_PASSWORD=your_16_character_app_password
```

Example:

```env
SMTP_EMAIL=example@gmail.com
SMTP_APP_PASSWORD=abcdefghijklmnop
```

Never commit the `.env` file to GitHub.

---

# ▶️ Start the Backend

From the `server` directory:

```bash
npm run dev
```

or:

```bash
node server.js
```

The backend will run at:

```text
http://localhost:5000
```

You can verify the backend using:

```text
http://localhost:5000/api/health
```

A successful response should indicate that the server is running.

---

# 🗃️ Database

The project uses SQLite with `better-sqlite3`.

The database is automatically initialized when the backend starts.

The database file is:

```text
server/lostfound.db
```

The application creates the required tables automatically.

Main tables include:

```text
users
items
claims
login_otps
verification_questions
claim_answers
```

The SQLite database is intentionally excluded from Git.

---

# 🔑 Authentication Flow

The authentication system works approximately as follows:

```text
Student
   │
   ▼
Register
   │
   ▼
Password hashed with bcrypt
   │
   ▼
Account created
   │
   ▼
Login request
   │
   ▼
OTP generated
   │
   ▼
OTP sent through Gmail SMTP
   │
   ▼
Student enters OTP
   │
   ▼
OTP verified
   │
   ▼
JWT issued
   │
   ▼
Authenticated session
```

---

# 🔐 Ownership Verification Flow

The core recovery workflow is designed to protect both parties.

```text
Finder reports item
        │
        ▼
Finder creates verification questions
        │
        ▼
Item appears on Found feed
        │
        ▼
Potential owner opens item
        │
        ▼
Answers verification questions
        │
        ▼
Claim submitted
        │
        ▼
Finder reviews answers privately
        │
        ├──────────────┐
        ▼              ▼
     Reject         Approve
                       │
                       ▼
                    Resolved
```

The claimant does not receive the finder's private contact details through the public listing.

---

# 🌐 API Overview

The backend exposes REST-style API endpoints.

## Authentication

```text
POST /api/auth/register
POST /api/auth/request-otp
POST /api/auth/verify-otp
POST /api/auth/resend-otp
GET  /api/auth/me
```

## Items

```text
GET  /api/items
GET  /api/items/:id
POST /api/items
```

Filtering is supported using query parameters such as:

```text
/api/items?type=LOST
/api/items?type=FOUND
/api/items?category=Wallets
/api/items?location=SJT
```

## Verification

```text
POST /api/items/:id/verification-questions
GET  /api/items/:id/verification-questions
```

## Claims

```text
POST  /api/items/:id/claims
POST  /api/claims/:claimId/answers
PATCH /api/claims/:claimId/status
GET   /api/my/found-items/claims
```

---

# 🧪 Testing the Application

A recommended testing sequence is:

### 1. Register two accounts

Use two different VIT email addresses.

### 2. Log in

Request the OTP and verify it.

### 3. Report a found item

Create a found-item listing using one account.

### 4. Add verification questions

From the finder dashboard, add custom ownership questions.

### 5. Switch accounts

Log in using the second account.

### 6. Open the found item

Answer the verification questions and submit a claim.

### 7. Return to the finder account

Open the dashboard and review the claim.

### 8. Approve or reject

Verify that the claim status changes appropriately.

### 9. Verify lifecycle behavior

Approved items should no longer remain in the active recovery feed.

---

# 🔒 Security Considerations

The project includes several security-focused measures:

* Passwords are hashed using bcrypt.
* Authentication uses signed JWTs.
* OTPs are stored as hashes rather than plaintext.
* OTPs expire after a limited period.
* OTP verification attempts are limited.
* Previous unused OTPs are invalidated when a new OTP is generated.
* Public item listings do not expose reporter identity.
* Claim verification answers are only accessible through protected routes.
* Campus locations are validated against an allowed list.
* Item categories are validated against an allowed list.
* Sensitive configuration is stored in environment variables.
* Database files and environment files are excluded from Git.

---

# 🧹 Input Validation

The backend validates important user input before interacting with the database.

Examples include:

* Required fields
* Email format
* VIT email domain
* Password requirements
* Item type
* Item category
* Campus location
* Verification questions
* Claim status
* OTP format

Invalid requests receive meaningful API error responses.

---

# 🔮 Future Improvements

The project is designed to be extended further.

Potential improvements include:

* 🔔 Real-time claim notifications
* 💬 Private in-app handoff communication
* 📍 Dedicated campus handoff checkpoints
* 📷 Image uploads for item reports
* 🔎 Advanced search and filtering
* 📱 Progressive Web App support
* 🧠 Duplicate/similar item detection
* 🤖 AI-assisted item categorization
* 📊 Recovery statistics and analytics
* 🛡️ Rate limiting and abuse prevention
* 📧 Email notifications for claim updates
* 🧑‍💼 Administrative moderation tools
* 📱 Mobile-first improvements

---

# 🤝 Contributing

Contributions and suggestions are welcome.

A typical workflow:

```bash
git checkout -b feature/your-feature
```

Make your changes, then:

```bash
git add .
git commit -m "Add your feature"
git push origin feature/your-feature
```

Then open a pull request.

---

# ⚠️ Privacy Notice

This project is intended for use within the VIT student community.

Do not commit:

```text
.env
server/.env
server/lostfound.db
```

Never expose:

* Gmail App Passwords
* JWT secrets
* Student passwords
* Private authentication information

---

# 📄 License

This project is currently intended as an educational and campus-focused software project.

Add an open-source license if the project is later intended for public redistribution.

---

# 👨‍💻 Project

**VIT Lost & Found Portal**

Built as a full-stack campus recovery platform for the VIT Vellore community.

Repository:

https://github.com/riteshneware0707-creator/VIT-Lost-and-Found-Portal
