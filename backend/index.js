const express = require("express");
const cors = require("cors");
const { admin } = require("./firebase");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Middleware to check Firebase token and extract role from custom claims
async function checkAuth(req, res, next) {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    console.error("❌ No token provided in Authorization header");
    return res.status(401).send("No token provided");
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    if (!decoded.role) {
      console.error("❌ No role found in token claims for UID:", decoded.uid);
      return res.status(403).send("No role assigned to this user");
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role,
    };

    console.log("✅ Token verified, UID:", decoded.uid, "Role:", decoded.role);
    next();
  } catch (err) {
    console.error("❌ Invalid token:", err);
    return res.status(403).send("Invalid token");
  }
}

// ✅ Role-based access middleware
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      console.error("❌ Unauthorized role:", req.user.role);
      return res.status(403).send("Access denied: insufficient permissions");
    }
    next();
  };
}

// ✅ Route to return role to frontend
app.get("/role", checkAuth, (req, res) => {
  console.log("✅ Sending role:", req.user.role);
  res.send({ role: req.user.role });
});

// ✅ Example: Protected route only for admin
app.get("/admin", checkAuth, authorizeRoles("admin"), (req, res) => {
  res.send("🛡️ Welcome, Admin!");
});

// ✅ Example: Protected route for admin or engineer
app.get("/dashboard", checkAuth, authorizeRoles("admin", "engineer"), (req, res) => {
  res.send(`👋 Hello ${req.user.role}, welcome to the dashboard!`);
});

// ✅ Start backend server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
