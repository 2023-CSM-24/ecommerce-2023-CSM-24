const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const requireAdmin = require("../middleware/adminAuth");

test("Admin authorization rejects missing or incorrect token", () => {
  process.env.ADMIN_TOKEN = "test-admin-token";

  const request = {
    headers: {}
  };

  let statusCode;
  let responseBody;

  const response = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(body) {
      responseBody = body;
    }
  };

  requireAdmin(request, response, () => {
    throw new Error("Unauthorized request should not reach next()");
  });

  assert.equal(statusCode, 401);
  assert.equal(responseBody.error, "Unauthorized");
});

test("Admin authorization accepts correct token", () => {
  process.env.ADMIN_TOKEN = "test-admin-token";

  const request = {
    headers: {
      authorization: "Bearer test-admin-token"
    }
  };

  const response = {
    status() {
      return this;
    },
    json() {}
  };

  let nextCalled = false;

  requireAdmin(request, response, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test("Database schema enforces unique category and product slugs", () => {
  const schemaPath = path.join(
    __dirname,
    "../../database/schema.sql"
  );

  const schema = fs.readFileSync(schemaPath, "utf8");

  assert.match(schema, /slug VARCHAR\(150\) NOT NULL UNIQUE/);
  assert.match(schema, /slug VARCHAR\(200\) NOT NULL UNIQUE/);
});

test("Database schema enforces unique SKU codes", () => {
  const schemaPath = path.join(
    __dirname,
    "../../database/schema.sql"
  );

  const schema = fs.readFileSync(schemaPath, "utf8");

  assert.match(schema, /sku_code VARCHAR\(100\) NOT NULL UNIQUE/);
});

test("Database schema prevents negative SKU price and stock", () => {
  const schemaPath = path.join(
    __dirname,
    "../../database/schema.sql"
  );

  const schema = fs.readFileSync(schemaPath, "utf8");

  assert.match(schema, /CONSTRAINT sku_price_non_negative/);
  assert.match(schema, /CONSTRAINT sku_stock_non_negative/);
  assert.match(schema, /CHECK \(price >= 0\)/);
  assert.match(schema, /CHECK \(stock_quantity >= 0\)/);
});

test("Database schema prevents a category from being its own parent", () => {
  const schemaPath = path.join(
    __dirname,
    "../../database/schema.sql"
  );

  const schema = fs.readFileSync(schemaPath, "utf8");

  assert.match(schema, /CONSTRAINT category_not_own_parent/);
  assert.match(schema, /parent_id IS NULL OR parent_id <> id/);
});
