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

function isValidDate(dateStr) {
  const date = new Date(dateStr);

  return !isNaN(date.getTime());
}

function isValidQuantity(quantity) {
  if (typeof quantity === "string") {
    quantity = quantity.trim();
  }

  const num = Number(quantity);

  return !Number.isNaN(num) && num > 0;
}

function normalizeStock(stock) {
  if (typeof stock === "string") {
    stock = stock.trim();
  }

  const num = Number(stock);

  if (Number.isNaN(num) || num < 0) {
    return null;
  }

  return num;
}

const unitMappings = {
  g: "g",
  gram: "g",
  grams: "g",
  sachet: "sachet",
  sachets: "sachet",
  piece: "piece",
  pieces: "piece",

  kg: "kg",
  kilogram: "kg",
  kilograms: "kg",

  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",

  l: "l",
  liter: "l",
  liters: "l",

  can: "can",
  cans: "can",

  bag: "bag",
  bags: "bag",

  bottle: "bottle",
  bottles: "bottle",

  box: "box",
  boxes: "box",
};

function normalizeUnit(unit) {
  if (!unit) return null;
  const normalized = unit.trim().toLowerCase().replace(/\s+/g, " ");
  return unitMappings[normalized] || null;
}

function getExpectedUnit(feedingTypeName) {
  const mapping = {
    "dry food": "g",
    "wet food": "sachet",
    treats: "piece",
  };
  return mapping[feedingTypeName.toLowerCase()] || null;
}

module.exports = {
  cleanString,
  normalizeEmail,
  normalizeMiddleInitial,
  isValidUUID,
  isValidDate,
  isValidQuantity,
  normalizeUnit,
  getExpectedUnit,
  normalizeStock,
};
