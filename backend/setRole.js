const { admin } = require("./firebase");

const uid = "YMCTOyNI0FVDbYpC91eaiM3DPMm1"; // ← Replace this with actual UID
const role = "admin"; // or "engineer", "user"

admin
  .auth()
  .setCustomUserClaims(uid, { role })
  .then(() => {
    console.log(`✅ Custom claim 'role: ${role}' set for UID: ${uid}`);
  })
  .catch((error) => {
    console.error("❌ Error setting custom claim:", error);
  });
