const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

const db = require("./database");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "change_this_secret_in_production";

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

/* =========================================================
   EMAIL TRANSPORTER
========================================================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

/* =========================================================
   CONSTANTS
========================================================= */

const ALLOWED_CATEGORIES = [
  "ID Cards",
  "Room Keys",
  "Calculators",
  "Lab Equipment",
  "Earphones",
  "Wallets",
];

const ALLOWED_LOCATIONS = [
  "SJT",
  "TT",
  "PRP",
  "SMV",
  "MB",
  "GDN",
  "CDMM",

  "MH-A",
  "MH-B",
  "MH-C",
  "MH-D",
  "MH-E",
  "MH-F",
  "MH-G",
  "MH-H",
  "MH-I",
  "MH-J",
  "MH-K",
  "MH-L",
  "MH-M",
  "MH-N",
  "MH-O",
  "MH-P",
  "MH-Q",
  "MH-R",
  "MH-S",
  "MH-T",

  "LH-A",
  "LH-B",
  "LH-C",
  "LH-D",
  "LH-E",
  "LH-F",
  "LH-G",
  "LH-H",
  "LH-I",
  "LH-J",

  "Gazebo",
  "Food Mall",
  "DC",

  "Central Library",
  "Sports Complex",
];

/* =========================================================
   HELPERS
========================================================= */

function isVitEmail(email) {
  return (
    typeof email === "string" &&
    email
      .trim()
      .toLowerCase()
      .endsWith("@vitstudent.ac.in")
  );
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      reg_no: user.reg_no,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function generateOTP() {
  return Math.floor(
    100000 + Math.random() * 900000
  ).toString();
}

function normalizeEmail(email) {
  return email
    .trim()
    .toLowerCase();
}

function validateRequiredString(
  value,
  fieldName,
  maxLength = 500
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return `${fieldName} is required.`;
  }

  if (value.trim().length > maxLength) {
    return `${fieldName} must be ${maxLength} characters or less.`;
  }

  return null;
}

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

function authenticateToken(
  req,
  res,
  next
) {
  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  const parts =
    authHeader.split(" ");

  if (
    parts.length !== 2 ||
    parts[0] !== "Bearer"
  ) {
    return res.status(401).json({
      message: "Invalid authorization format.",
    });
  }

  const token = parts[1];

  try {
    const decoded =
      jwt.verify(
        token,
        JWT_SECRET
      );

    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({
      message:
        "Invalid or expired token.",
    });
  }
}

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      message:
        "VIT Lost and Found API is running.",
    });
  }
);

/* =========================================================
   REGISTER
========================================================= */

app.post(
  "/api/auth/register",
  async (req, res) => {
    try {
      const {
        name,
        reg_no,
        email,
        password,
      } = req.body;

      const nameError =
        validateRequiredString(
          name,
          "Name",
          100
        );

      if (nameError) {
        return res.status(400).json({
          message: nameError,
        });
      }

      const regError =
        validateRequiredString(
          reg_no,
          "Registration number",
          50
        );

      if (regError) {
        return res.status(400).json({
          message: regError,
        });
      }

      const emailError =
        validateRequiredString(
          email,
          "Email",
          150
        );

      if (emailError) {
        return res.status(400).json({
          message: emailError,
        });
      }

      if (!isVitEmail(email)) {
        return res.status(400).json({
          message:
            "Only VIT student email addresses are allowed.",
        });
      }

      if (
        typeof password !== "string" ||
        password.length < 6
      ) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters long.",
        });
      }

      const normalizedEmail =
        normalizeEmail(email);

      const normalizedRegNo =
        reg_no
          .trim()
          .toUpperCase();

      const existingUser =
        db.prepare(
          `
          SELECT id
          FROM users
          WHERE email = ?
             OR reg_no = ?
          `
        ).get(
          normalizedEmail,
          normalizedRegNo
        );

      if (existingUser) {
        return res.status(409).json({
          message:
            "An account with this email or registration number already exists.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const result =
        db.prepare(
          `
          INSERT INTO users
          (
            name,
            reg_no,
            email,
            password
          )
          VALUES (?, ?, ?, ?)
          `
        ).run(
          name.trim(),
          normalizedRegNo,
          normalizedEmail,
          hashedPassword
        );

      const user =
        db.prepare(
          `
          SELECT
            id,
            name,
            reg_no,
            email
          FROM users
          WHERE id = ?
          `
        ).get(result.lastInsertRowid);

      const token =
        createToken(user);

      return res.status(201).json({
        message:
          "Registration successful.",
        token,
        user,
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      return res.status(500).json({
        message:
          "Registration failed.",
      });
    }
  }
);

/* =========================================================
   REQUEST LOGIN OTP
========================================================= */

app.post(
  "/api/auth/request-otp",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (
        typeof email !== "string" ||
        !email.trim()
      ) {
        return res.status(400).json({
          message:
            "Email is required.",
        });
      }

      if (
        typeof password !== "string" ||
        !password
      ) {
        return res.status(400).json({
          message:
            "Password is required.",
        });
      }

      const normalizedEmail =
        normalizeEmail(email);

      const user =
        db.prepare(
          `
          SELECT *
          FROM users
          WHERE email = ?
          `
        ).get(normalizedEmail);

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      const passwordValid =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordValid) {
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      /*
        Invalidate all previous unused OTPs.
      */

      db.prepare(
        `
        UPDATE login_otps
        SET used = 1
        WHERE user_id = ?
          AND used = 0
        `
      ).run(user.id);

      const otp =
        generateOTP();

      const otpHash =
        await bcrypt.hash(
          otp,
          10
        );

      const expiresAt =
        new Date(
          Date.now() +
            5 * 60 * 1000
        ).toISOString();

      db.prepare(
        `
        INSERT INTO login_otps
        (
          user_id,
          otp_hash,
          expires_at,
          attempts,
          used
        )
        VALUES (?, ?, ?, 0, 0)
        `
      ).run(
        user.id,
        otpHash,
        expiresAt
      );

      await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: user.email,
        subject:
          "VIT Lost & Found Login OTP",
        text:
          `Your VIT Lost & Found login OTP is ${otp}.\n\n` +
          `This OTP will expire in 5 minutes.\n\n` +
          `If you did not request this OTP, you can safely ignore this email.`,
      });

      return res.json({
        message:
          "OTP sent to your VIT email address.",
      });
    } catch (error) {
      console.error(
        "OTP request error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to send OTP.",
      });
    }
  }
);

/* =========================================================
   VERIFY LOGIN OTP
========================================================= */

app.post(
  "/api/auth/verify-otp",
  async (req, res) => {
    try {
      const {
        email,
        otp,
      } = req.body;

      if (
        typeof email !== "string" ||
        !email.trim()
      ) {
        return res.status(400).json({
          message:
            "Email is required.",
        });
      }

      if (
        typeof otp !== "string" ||
        !/^\d{6}$/.test(otp)
      ) {
        return res.status(400).json({
          message:
            "Enter a valid 6-digit OTP.",
        });
      }

      const normalizedEmail =
        normalizeEmail(email);

      const user =
        db.prepare(
          `
          SELECT *
          FROM users
          WHERE email = ?
          `
        ).get(normalizedEmail);

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid OTP request.",
        });
      }

      const otpRecord =
        db.prepare(
          `
          SELECT *
          FROM login_otps
          WHERE user_id = ?
            AND used = 0
          ORDER BY id DESC
          LIMIT 1
          `
        ).get(user.id);

      if (!otpRecord) {
        return res.status(400).json({
          message:
            "No active OTP found. Please request a new OTP.",
        });
      }

      if (
        new Date(
          otpRecord.expires_at
        ).getTime() <
        Date.now()
      ) {
        db.prepare(
          `
          UPDATE login_otps
          SET used = 1
          WHERE id = ?
          `
        ).run(otpRecord.id);

        return res.status(400).json({
          message:
            "OTP has expired. Please request a new one.",
        });
      }

      if (
        otpRecord.attempts >= 5
      ) {
        db.prepare(
          `
          UPDATE login_otps
          SET used = 1
          WHERE id = ?
          `
        ).run(otpRecord.id);

        return res.status(429).json({
          message:
            "Too many incorrect attempts. Please request a new OTP.",
        });
      }

      const otpValid =
        await bcrypt.compare(
          otp,
          otpRecord.otp_hash
        );

      if (!otpValid) {
        db.prepare(
          `
          UPDATE login_otps
          SET attempts = attempts + 1
          WHERE id = ?
          `
        ).run(otpRecord.id);

        return res.status(401).json({
          message:
            "Incorrect OTP.",
        });
      }

      db.prepare(
        `
        UPDATE login_otps
        SET used = 1
        WHERE id = ?
        `
      ).run(otpRecord.id);

      const safeUser = {
        id: user.id,
        name: user.name,
        reg_no: user.reg_no,
        email: user.email,
      };

      const token =
        createToken(safeUser);

      return res.json({
        message:
          "Login successful.",
        token,
        user: safeUser,
      });
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      return res.status(500).json({
        message:
          "OTP verification failed.",
      });
    }
  }
);

/* =========================================================
   RESEND OTP
========================================================= */

app.post(
  "/api/auth/resend-otp",
  async (req, res) => {
    try {
      const { email } =
        req.body;

      if (
        typeof email !== "string" ||
        !email.trim()
      ) {
        return res.status(400).json({
          message:
            "Email is required.",
        });
      }

      const normalizedEmail =
        normalizeEmail(email);

      const user =
        db.prepare(
          `
          SELECT *
          FROM users
          WHERE email = ?
          `
        ).get(normalizedEmail);

      if (!user) {
        return res.status(404).json({
          message:
            "Account not found.",
        });
      }

      db.prepare(
        `
        UPDATE login_otps
        SET used = 1
        WHERE user_id = ?
          AND used = 0
        `
      ).run(user.id);

      const otp =
        generateOTP();

      const otpHash =
        await bcrypt.hash(
          otp,
          10
        );

      const expiresAt =
        new Date(
          Date.now() +
            5 * 60 * 1000
        ).toISOString();

      db.prepare(
        `
        INSERT INTO login_otps
        (
          user_id,
          otp_hash,
          expires_at,
          attempts,
          used
        )
        VALUES (?, ?, ?, 0, 0)
        `
      ).run(
        user.id,
        otpHash,
        expiresAt
      );

      await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: user.email,
        subject:
          "VIT Lost & Found - New Login OTP",
        text:
          `Your new login OTP is ${otp}.\n\n` +
          `This OTP will expire in 5 minutes.`,
      });

      return res.json({
        message:
          "A new OTP has been sent.",
      });
    } catch (error) {
      console.error(
        "Resend OTP error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to resend OTP.",
      });
    }
  }
);

/* =========================================================
   CURRENT USER
========================================================= */

app.get(
  "/api/auth/me",
  authenticateToken,
  (req, res) => {
    const user =
      db.prepare(
        `
        SELECT
          id,
          name,
          reg_no,
          email,
          created_at
        FROM users
        WHERE id = ?
        `
      ).get(req.user.id);

    if (!user) {
      return res.status(404).json({
        message:
          "User not found.",
      });
    }

    res.json({
      user,
    });
  }
);

/* =========================================================
   GET ITEMS
========================================================= */

app.get(
  "/api/items",
  (req, res) => {
    try {
      const {
        type,
        category,
        location,
        mine,
      } = req.query;

      let query = `
        SELECT
          i.id,
          i.type,
          i.title,
          i.description,
          i.category,
          i.location,
          i.date,
          i.status,
          i.created_at
        FROM items i
      `;

      const conditions = [];
      const params = [];

      /*
        Public endpoint deliberately does NOT
        return reporter identity.
      */

      if (
        type === "LOST" ||
        type === "FOUND"
      ) {
        conditions.push(
          "i.type = ?"
        );

        params.push(type);
      }

      if (
        typeof category === "string" &&
        ALLOWED_CATEGORIES.includes(
          category
        )
      ) {
        conditions.push(
          "i.category = ?"
        );

        params.push(category);
      }

      if (
        typeof location === "string" &&
        ALLOWED_LOCATIONS.includes(
          location
        )
      ) {
        conditions.push(
          "i.location = ?"
        );

        params.push(location);
      }

      /*
        mine=true requires authentication.
        Since this endpoint is normally public,
        read the token manually here.
      */

      if (mine === "true") {
        const authHeader =
          req.headers.authorization;

        if (!authHeader) {
          return res.status(401).json({
            message:
              "Authentication required to view your items.",
          });
        }

        const parts =
          authHeader.split(" ");

        if (
          parts.length !== 2 ||
          parts[0] !== "Bearer"
        ) {
          return res.status(401).json({
            message:
              "Invalid authorization format.",
          });
        }

        try {
          const decoded =
            jwt.verify(
              parts[1],
              JWT_SECRET
            );

          conditions.push(
            "i.user_id = ?"
          );

          params.push(
            decoded.id
          );
        } catch {
          return res.status(401).json({
            message:
              "Invalid or expired token.",
          });
        }
      }

      if (conditions.length > 0) {
        query +=
          " WHERE " +
          conditions.join(" AND ");
      }

      query +=
        " ORDER BY i.created_at DESC";

      const items =
        db.prepare(query).all(
          ...params
        );

      return res.json({
        items,
      });
    } catch (error) {
      console.error(
        "Get items error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch items.",
      });
    }
  }
);

/* =========================================================
   GET SINGLE ITEM
========================================================= */

app.get(
  "/api/items/:id",
  (req, res) => {
    try {
      const itemId =
        Number(req.params.id);

      if (
        !Number.isInteger(itemId) ||
        itemId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid item ID.",
        });
      }

      const item =
        db.prepare(
          `
          SELECT
            i.id,
            i.type,
            i.title,
            i.description,
            i.category,
            i.location,
            i.date,
            i.status,
            i.created_at
          FROM items i
          WHERE i.id = ?
          `
        ).get(itemId);

      if (!item) {
        return res.status(404).json({
          message:
            "Item not found.",
        });
      }

      return res.json({
        item,
      });
    } catch (error) {
      console.error(
        "Get item error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch item.",
      });
    }
  }
);

/* =========================================================
   CREATE ITEM
========================================================= */

app.post(
  "/api/items",
  authenticateToken,
  (req, res) => {
    try {
      const {
        type,
        title,
        description,
        category,
        location,
        date,
      } = req.body;

      if (
        type !== "LOST" &&
        type !== "FOUND"
      ) {
        return res.status(400).json({
          message:
            "Type must be either LOST or FOUND.",
        });
      }

      const titleError =
        validateRequiredString(
          title,
          "Title",
          150
        );

      if (titleError) {
        return res.status(400).json({
          message: titleError,
        });
      }

      const descriptionError =
        validateRequiredString(
          description,
          "Description",
          1000
        );

      if (descriptionError) {
        return res.status(400).json({
          message:
            descriptionError,
        });
      }

      if (
        !ALLOWED_CATEGORIES.includes(
          category
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid item category.",
        });
      }

      if (
        !ALLOWED_LOCATIONS.includes(
          location
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid VIT campus location.",
        });
      }

      if (
        typeof date !== "string" ||
        !date.trim()
      ) {
        return res.status(400).json({
          message:
            "Date is required.",
        });
      }

      const result =
        db.prepare(
          `
          INSERT INTO items
          (
            user_id,
            type,
            title,
            description,
            category,
            location,
            date
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `
        ).run(
          req.user.id,
          type,
          title.trim(),
          description.trim(),
          category,
          location,
          date.trim()
        );

      const item =
        db.prepare(
          `
          SELECT
            id,
            type,
            title,
            description,
            category,
            location,
            date,
            status,
            created_at
          FROM items
          WHERE id = ?
          `
        ).get(
          result.lastInsertRowid
        );

      return res.status(201).json({
        message:
          "Item reported successfully.",
        item,
      });
    } catch (error) {
      console.error(
        "Create item error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to report item.",
      });
    }
  }
);

/* =========================================================
   CREATE CLAIM
========================================================= */

app.post(
  "/api/items/:id/claims",
  authenticateToken,
  (req, res) => {
    try {
      const itemId =
        Number(req.params.id);

      const {
        message = "",
      } = req.body;

      if (
        !Number.isInteger(itemId) ||
        itemId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid item ID.",
        });
      }

      if (
        typeof message !== "string"
      ) {
        return res.status(400).json({
          message:
            "Claim message must be text.",
        });
      }

      if (
        message.trim().length > 1000
      ) {
        return res.status(400).json({
          message:
            "Claim message must be 1000 characters or less.",
        });
      }

      const item =
        db.prepare(
          `
          SELECT *
          FROM items
          WHERE id = ?
          `
        ).get(itemId);

      if (!item) {
        return res.status(404).json({
          message:
            "Item not found.",
        });
      }

      if (
        item.type !== "FOUND"
      ) {
        return res.status(400).json({
          message:
            "Only found items can be claimed.",
        });
      }

      if (
        item.status !== "ACTIVE"
      ) {
        return res.status(400).json({
          message:
            "This item is no longer active.",
        });
      }

      if (
        item.user_id ===
        req.user.id
      ) {
        return res.status(400).json({
          message:
            "You cannot claim your own found item.",
        });
      }

      const existingClaim =
        db.prepare(
          `
          SELECT id
          FROM claims
          WHERE item_id = ?
            AND claimant_id = ?
            AND status = 'PENDING'
          `
        ).get(
          itemId,
          req.user.id
        );

      if (existingClaim) {
        return res.status(409).json({
          message:
            "You already have a pending claim for this item.",
        });
      }

      const result =
        db.prepare(
          `
          INSERT INTO claims
          (
            item_id,
            claimant_id,
            message
          )
          VALUES (?, ?, ?)
          `
        ).run(
          itemId,
          req.user.id,
          message.trim()
        );

      return res.status(201).json({
        message:
          "Claim submitted successfully.",
        claimId:
          result.lastInsertRowid,
      });
    } catch (error) {
      console.error(
        "Create claim error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to submit claim.",
      });
    }
  }
);

/* =========================================================
   CREATE VERIFICATION QUESTIONS
========================================================= */

app.post(
  "/api/items/:id/verification-questions",
  authenticateToken,
  (req, res) => {
    try {
      const itemId =
        Number(req.params.id);

      const {
        questions,
      } = req.body;

      if (
        !Number.isInteger(itemId) ||
        itemId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid item ID.",
        });
      }

      if (
        !Array.isArray(questions)
      ) {
        return res.status(400).json({
          message:
            "Questions must be provided as an array.",
        });
      }

      if (
        questions.length < 1 ||
        questions.length > 3
      ) {
        return res.status(400).json({
          message:
            "You must provide between 1 and 3 questions.",
        });
      }

      const cleanedQuestions =
        questions.map(
          (question) =>
            typeof question ===
            "string"
              ? question.trim()
              : ""
        );

      if (
        cleanedQuestions.some(
          (question) =>
            !question
        )
      ) {
        return res.status(400).json({
          message:
            "All questions are required.",
        });
      }

      if (
        cleanedQuestions.some(
          (question) =>
            question.length >
            300
        )
      ) {
        return res.status(400).json({
          message:
            "Each question must be 300 characters or less.",
        });
      }

      /*
        Prevent duplicate questions.
      */

      const uniqueQuestions =
        new Set(
          cleanedQuestions.map(
            (question) =>
              question.toLowerCase()
          )
        );

      if (
        uniqueQuestions.size !==
        cleanedQuestions.length
      ) {
        return res.status(400).json({
          message:
            "Questions must be different.",
        });
      }

      const item =
        db.prepare(
          `
          SELECT *
          FROM items
          WHERE id = ?
          `
        ).get(itemId);

      if (!item) {
        return res.status(404).json({
          message:
            "Item not found.",
        });
      }

      if (
        item.type !== "FOUND"
      ) {
        return res.status(400).json({
          message:
            "Verification questions can only be added to found items.",
        });
      }

      if (
        item.user_id !==
        req.user.id
      ) {
        return res.status(403).json({
          message:
            "You can only manage verification questions for your own found items.",
        });
      }

      const existingQuestions =
        db.prepare(
          `
          SELECT id
          FROM verification_questions
          WHERE item_id = ?
          `
        ).all(itemId);

      if (
        existingQuestions.length > 0
      ) {
        return res.status(409).json({
          message:
            "Verification questions have already been created for this item.",
        });
      }

      const insert =
        db.prepare(
          `
          INSERT INTO verification_questions
          (
            item_id,
            question
          )
          VALUES (?, ?)
          `
        );

      const transaction =
        db.transaction(
          (questionList) => {
            for (
              const question of questionList
            ) {
              insert.run(
                itemId,
                question
              );
            }
          }
        );

      transaction(
        cleanedQuestions
      );

      return res.status(201).json({
        message:
          "Verification questions created successfully.",
      });
    } catch (error) {
      console.error(
        "Create verification questions error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to create verification questions.",
      });
    }
  }
);

/* =========================================================
   GET VERIFICATION QUESTIONS
========================================================= */

app.get(
  "/api/items/:id/verification-questions",
  authenticateToken,
  (req, res) => {
    try {
      const itemId =
        Number(req.params.id);

      if (
        !Number.isInteger(itemId) ||
        itemId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid item ID.",
        });
      }

      const item =
        db.prepare(
          `
          SELECT
            id,
            user_id,
            type,
            status
          FROM items
          WHERE id = ?
          `
        ).get(itemId);

      if (!item) {
        return res.status(404).json({
          message:
            "Item not found.",
        });
      }

      if (
        item.type !== "FOUND"
      ) {
        return res.status(400).json({
          message:
            "Verification questions are only available for found items.",
        });
      }

      const questions =
        db.prepare(
          `
          SELECT
            id,
            question
          FROM verification_questions
          WHERE item_id = ?
          ORDER BY id ASC
          `
        ).all(itemId);

      return res.json({
        questions,
      });
    } catch (error) {
      console.error(
        "Get verification questions error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch verification questions.",
      });
    }
  }
);

/* =========================================================
   SUBMIT CLAIM ANSWERS
========================================================= */

app.post(
  "/api/claims/:claimId/answers",
  authenticateToken,
  (req, res) => {
    try {
      const claimId =
        Number(req.params.claimId);

      const {
        answers,
      } = req.body;

      if (
        !Number.isInteger(claimId) ||
        claimId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid claim ID.",
        });
      }

      if (
        !Array.isArray(answers)
      ) {
        return res.status(400).json({
          message:
            "Answers must be provided as an array.",
        });
      }

      const claim =
        db.prepare(
          `
          SELECT
            c.*,
            i.status AS item_status,
            i.type AS item_type
          FROM claims c
          JOIN items i
            ON i.id = c.item_id
          WHERE c.id = ?
          `
        ).get(claimId);

      if (!claim) {
        return res.status(404).json({
          message:
            "Claim not found.",
        });
      }

      if (
        claim.claimant_id !==
        req.user.id
      ) {
        return res.status(403).json({
          message:
            "You can only answer your own claim.",
        });
      }

      if (
        claim.status !==
        "PENDING"
      ) {
        return res.status(400).json({
          message:
            "This claim has already been reviewed.",
        });
      }

      if (
        claim.item_type !==
        "FOUND"
      ) {
        return res.status(400).json({
          message:
            "Invalid claim item.",
        });
      }

      if (
        claim.item_status !==
        "ACTIVE"
      ) {
        return res.status(400).json({
          message:
            "This item is no longer active.",
        });
      }

      const questions =
        db.prepare(
          `
          SELECT
            id,
            question
          FROM verification_questions
          WHERE item_id = ?
          ORDER BY id ASC
          `
        ).all(
          claim.item_id
        );

      if (
        questions.length === 0
      ) {
        return res.status(400).json({
          message:
            "The finder has not added verification questions yet.",
        });
      }

      if (
        answers.length !==
        questions.length
      ) {
        return res.status(400).json({
          message:
            "You must answer every verification question.",
        });
      }

      const answerMap =
        new Map();

      for (
        const answer of answers
      ) {
        if (
          !answer ||
          !Number.isInteger(
            Number(answer.question_id)
          ) ||
          typeof answer.answer !==
            "string"
        ) {
          return res.status(400).json({
            message:
              "Invalid answer format.",
          });
        }

        const questionId =
          Number(
            answer.question_id
          );

        const text =
          answer.answer.trim();

        if (!text) {
          return res.status(400).json({
            message:
              "All verification answers are required.",
          });
        }

        if (
          text.length > 500
        ) {
          return res.status(400).json({
            message:
              "Each answer must be 500 characters or less.",
          });
        }

        if (
          answerMap.has(questionId)
        ) {
          return res.status(400).json({
            message:
              "Duplicate verification question.",
          });
        }

        answerMap.set(
          questionId,
          text
        );
      }

      for (
        const question of questions
      ) {
        if (
          !answerMap.has(
            question.id
          )
        ) {
          return res.status(400).json({
            message:
              "You must answer every verification question.",
          });
        }
      }

      const existingAnswers =
        db.prepare(
          `
          SELECT id
          FROM claim_answers
          WHERE claim_id = ?
          `
        ).all(claimId);

      if (
        existingAnswers.length > 0
      ) {
        return res.status(409).json({
          message:
            "Answers have already been submitted for this claim.",
        });
      }

      const insert =
        db.prepare(
          `
          INSERT INTO claim_answers
          (
            claim_id,
            question_id,
            answer
          )
          VALUES (?, ?, ?)
          `
        );

      const transaction =
        db.transaction(
          (questionList) => {
            for (
              const question of questionList
            ) {
              insert.run(
                claimId,
                question.id,
                answerMap.get(
                  question.id
                )
              );
            }
          }
        );

      transaction(
        questions
      );

      return res.status(201).json({
        message:
          "Verification answers submitted successfully.",
      });
    } catch (error) {
      console.error(
        "Submit claim answers error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to submit claim answers.",
      });
    }
  }
);

/* =========================================================
   FINDER DASHBOARD - GET CLAIMS
========================================================= */

app.get(
  "/api/my/found-items/claims",
  authenticateToken,
  (req, res) => {
    try {
      const claims =
        db.prepare(
          `
          SELECT
            c.id,
            c.item_id,
            c.claimant_id,
            c.message,
            c.status,
            c.created_at,

            u.name AS claimant_name,
            u.reg_no AS claimant_reg_no,
            u.email AS claimant_email,

            i.title AS item_title,
            i.category AS item_category,
            i.location AS item_location

          FROM claims c

          JOIN items i
            ON i.id = c.item_id

          JOIN users u
            ON u.id = c.claimant_id

          WHERE i.user_id = ?

          ORDER BY
            c.created_at DESC
          `
        ).all(
          req.user.id
        );

      const claimsWithAnswers =
        claims.map(
          (claim) => {
            const answers =
              db.prepare(
                `
                SELECT
                  ca.question_id,
                  ca.answer,
                  vq.question

                FROM claim_answers ca

                JOIN verification_questions vq
                  ON vq.id = ca.question_id

                WHERE ca.claim_id = ?

                ORDER BY vq.id ASC
                `
              ).all(
                claim.id
              );

            return {
              ...claim,
              answers,
            };
          }
        );

      return res.json({
        claims:
          claimsWithAnswers,
      });
    } catch (error) {
      console.error(
        "Get dashboard claims error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch claims.",
      });
    }
  }
);

/* =========================================================
   REVIEW CLAIM
========================================================= */

app.patch(
  "/api/claims/:claimId/status",
  authenticateToken,
  (req, res) => {
    try {
      const claimId =
        Number(req.params.claimId);

      const {
        status,
      } = req.body;

      if (
        !Number.isInteger(claimId) ||
        claimId <= 0
      ) {
        return res.status(400).json({
          message:
            "Invalid claim ID.",
        });
      }

      if (
        status !== "APPROVED" &&
        status !== "REJECTED"
      ) {
        return res.status(400).json({
          message:
            "Status must be APPROVED or REJECTED.",
        });
      }

      const claim =
        db.prepare(
          `
          SELECT
            c.id,
            c.status,
            c.item_id,
            i.user_id AS finder_id,
            i.status AS item_status
          FROM claims c

          JOIN items i
            ON i.id = c.item_id

          WHERE c.id = ?
          `
        ).get(claimId);

      if (!claim) {
        return res.status(404).json({
          message:
            "Claim not found.",
        });
      }

      if (
        claim.finder_id !==
        req.user.id
      ) {
        return res.status(403).json({
          message:
            "You can only review claims for your own found items.",
        });
      }

      if (
        claim.status !==
        "PENDING"
      ) {
        return res.status(400).json({
          message:
            "This claim has already been reviewed.",
        });
      }

      db.prepare(
        `
        UPDATE claims
        SET status = ?
        WHERE id = ?
        `
      ).run(
        status,
        claimId
      );

      /*
        If a claim is approved, mark the item
        as RESOLVED.

        This automatically removes it from
        active campus feeds.
      */

      if (
        status === "APPROVED"
      ) {
        db.prepare(
          `
          UPDATE items
          SET status = 'RESOLVED'
          WHERE id = ?
          `
        ).run(
          claim.item_id
        );
      }

      return res.json({
        message:
          status === "APPROVED"
            ? "Claim approved and item marked as resolved."
            : "Claim rejected successfully.",
      });
    } catch (error) {
      console.error(
        "Review claim error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to review claim.",
      });
    }
  }
);

/* =========================================================
   START SERVER
========================================================= */

app.listen(
  PORT,
  () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  }
);