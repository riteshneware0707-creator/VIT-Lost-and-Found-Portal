const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const db = require("./database");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing from .env");
  process.exit(1);
}

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

/* =========================
   HELPER FUNCTIONS
========================= */

function isVitEmail(email) {
  const normalizedEmail = email.toLowerCase().trim();

  return (
    normalizedEmail.endsWith("@vitstudent.ac.in") ||
    normalizedEmail.endsWith("@vit.ac.in")
  );
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      reg_no: user.reg_no,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}

/* =========================
   HEALTH CHECK
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "VIT Lost & Found API is running",
  });
});

/* =========================
   REGISTER
========================= */

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      reg_no,
      email,
      password,
    } = req.body;

    if (!name || !reg_no || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const normalizedRegNo = reg_no.trim();

    if (!isVitEmail(normalizedEmail)) {
      return res.status(403).json({
        message:
          "Only VIT student email addresses can register.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters.",
      });
    }

    const existingUser = db
      .prepare(
        `
        SELECT id
        FROM users
        WHERE email = ? OR reg_no = ?
        `
      )
      .get(
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
      await bcrypt.hash(password, 10);

    const result = db
      .prepare(
        `
        INSERT INTO users
        (name, reg_no, email, password)
        VALUES (?, ?, ?, ?)
        `
      )
      .run(
        name.trim(),
        normalizedRegNo,
        normalizedEmail,
        hashedPassword
      );

    const user = {
      id: result.lastInsertRowid,
      name: name.trim(),
      reg_no: normalizedRegNo,
      email: normalizedEmail,
    };

    const token = createToken(user);

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    res.status(500).json({
      message: "Registration failed",
    });
  }
});

/* =========================
   LOGIN
========================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    const user = db
      .prepare(
        `
        SELECT *
        FROM users
        WHERE email = ?
        `
      )
      .get(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      reg_no: user.reg_no,
      email: user.email,
    };

    const token = createToken(safeUser);

    res.json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    res.status(500).json({
      message: "Login failed",
    });
  }
});

/* =========================
   CURRENT USER
========================= */

app.get(
  "/api/auth/me",
  authenticateToken,
  (req, res) => {
    const user = db
      .prepare(
        `
        SELECT
          id,
          name,
          reg_no,
          email
        FROM users
        WHERE id = ?
        `
      )
      .get(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  }
);

/* =========================
   GET ALL ACTIVE ITEMS
========================= */

app.get("/api/items", (req, res) => {
  try {
    const {
      type,
      category,
      location,
      search,
    } = req.query;

    let query = `
      SELECT
        items.id,
        items.type,
        items.title,
        items.description,
        items.category,
        items.location,
        items.date,
        items.status,
        items.created_at
      FROM items
      WHERE items.status = 'ACTIVE'
    `;

    const params = [];

    if (type) {
      if (
        type !== "LOST" &&
        type !== "FOUND"
      ) {
        return res.status(400).json({
          message: "Invalid item type",
        });
      }

      query += `
        AND items.type = ?
      `;

      params.push(type);
    }

    if (category) {
      query += `
        AND items.category = ?
      `;

      params.push(category);
    }

    if (location) {
      query += `
        AND items.location = ?
      `;

      params.push(location);
    }

    if (search) {
      query += `
        AND (
          items.title LIKE ?
          OR items.description LIKE ?
        )
      `;

      params.push(
        `%${search}%`,
        `%${search}%`
      );
    }

    query += `
      ORDER BY items.created_at DESC
    `;

    const items = db
      .prepare(query)
      .all(...params);

    res.json({
      items,
    });
  } catch (error) {
    console.error(
      "Get items error:",
      error
    );

    res.status(500).json({
      message: "Failed to load items",
    });
  }
});

/* =========================
   GET SINGLE ITEM
========================= */

app.get(
  "/api/items/:id",
  (req, res) => {
    try {
      const item = db
        .prepare(
          `
          SELECT
            items.id,
            items.type,
            items.title,
            items.description,
            items.category,
            items.location,
            items.date,
            items.status,
            items.created_at
          FROM items
          WHERE items.id = ?
          `
        )
        .get(req.params.id);

      if (!item) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      res.json({
        item,
      });
    } catch (error) {
      console.error(
        "Get single item error:",
        error
      );

      res.status(500).json({
        message: "Failed to load item",
      });
    }
  }
);

/* =========================
   CREATE ITEM
========================= */

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
        !type ||
        !title ||
        !description ||
        !category ||
        !location ||
        !date
      ) {
        return res.status(400).json({
          message:
            "All item fields are required",
        });
      }

      if (
        type !== "LOST" &&
        type !== "FOUND"
      ) {
        return res.status(400).json({
          message: "Invalid item type",
        });
      }

      const result = db
        .prepare(
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
        )
        .run(
          req.user.id,
          type,
          title.trim(),
          description.trim(),
          category,
          location,
          date
        );

      const item = db
        .prepare(
          `
          SELECT
            id,
            user_id,
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
        )
        .get(
          result.lastInsertRowid
        );

      res.status(201).json({
        message:
          "Item reported successfully",
        item,
      });
    } catch (error) {
      console.error(
        "Create item error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to report item",
      });
    }
  }
);

/* =========================
   CLAIM FOUND ITEM
========================= */

app.post(
  "/api/items/:id/claims",
  authenticateToken,
  (req, res) => {
    try {
      const { message } = req.body;

      const item = db
        .prepare(
          `
          SELECT
            id,
            user_id,
            type,
            status
          FROM items
          WHERE id = ?
          `
        )
        .get(req.params.id);

      if (!item) {
        return res.status(404).json({
          message: "Item not found",
        });
      }

      if (item.status !== "ACTIVE") {
        return res.status(400).json({
          message:
            "This item is no longer active.",
        });
      }

      if (item.type !== "FOUND") {
        return res.status(400).json({
          message:
            "Only found items can receive claims.",
        });
      }

      if (
        item.user_id === req.user.id
      ) {
        return res.status(400).json({
          message:
            "You cannot claim an item you reported.",
        });
      }

      const existingClaim = db
        .prepare(
          `
          SELECT id
          FROM claims
          WHERE item_id = ?
          AND claimant_id = ?
          AND status = 'PENDING'
          `
        )
        .get(
          item.id,
          req.user.id
        );

      if (existingClaim) {
        return res.status(409).json({
          message:
            "You already have a pending claim for this item.",
        });
      }

      const result = db
        .prepare(
          `
          INSERT INTO claims
          (
            item_id,
            claimant_id,
            message
          )
          VALUES (?, ?, ?)
          `
        )
        .run(
          item.id,
          req.user.id,
          message
            ? message.trim()
            : ""
        );

      res.status(201).json({
        message:
          "Claim submitted successfully",
        claimId:
          result.lastInsertRowid,
      });
    } catch (error) {
      console.error(
        "Claim error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to submit claim",
      });
    }
  }
);

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `VIT Lost & Found API running on http://localhost:${PORT}`
  );
});