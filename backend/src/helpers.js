const { validate } = require("uuid");

function cleanString(str) {
  return str ? str.trim().replace(/\s+/g, " ") : null;
}

function normalizeEmail(str) {
  return str ? str.trim().replace(/\s+/g, " ").toLowerCase() : null;
}

function normalizeMiddleInitial(str) {
  if (!str) return null;
  const cleaned = str.trim();
  return cleaned.length > 0 ? cleaned[0].toUpperCase() : null;
}

function isValidUUID(id) {
  return validate(id);
}

module.exports = {
  cleanString,
  normalizeEmail,
  normalizeMiddleInitial,
  isValidUUID,
};
