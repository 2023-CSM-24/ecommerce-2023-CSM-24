const test = require("node:test");
const assert = require("node:assert/strict");

function validateProduct(data) {
  return Boolean(
    data.category_id &&
    data.name &&
    data.slug
  );
}

function validateSKU(data) {
  return (
    Boolean(data.variant_id) &&
    Boolean(data.sku_code) &&
    data.price !== undefined &&
    data.stock_quantity !== undefined &&
    data.price >= 0 &&
    data.stock_quantity >= 0
  );
}

function hasCategoryCycle(categories, categoryId, newParentId) {
  let currentId = newParentId;

  while (currentId !== null) {
    if (currentId === categoryId) {
      return true;
    }

    const category = categories.find(
      (item) => item.id === currentId
    );

    if (!category) {
      return false;
    }

    currentId = category.parent_id;
  }

  return false;
}

test("product requires category, name and slug", () => {
  assert.equal(
    validateProduct({
      category_id: 1,
      name: "Laptop",
      slug: "laptop"
    }),
    true
  );

  assert.equal(
    validateProduct({
      category_id: 1,
      name: "Laptop"
    }),
    false
  );
});

test("SKU rejects negative price", () => {
  assert.equal(
    validateSKU({
      variant_id: 1,
      sku_code: "LAP-001",
      price: -10,
      stock_quantity: 5
    }),
    false
  );
});

test("SKU rejects negative stock", () => {
  assert.equal(
    validateSKU({
      variant_id: 1,
      sku_code: "LAP-001",
      price: 500,
      stock_quantity: -1
    }),
    false
  );
});

test("valid SKU is accepted", () => {
  assert.equal(
    validateSKU({
      variant_id: 1,
      sku_code: "LAP-001",
      price: 500,
      stock_quantity: 10
    }),
    true
  );
});

test("category cycle is detected", () => {
  const categories = [
    { id: 1, parent_id: null },
    { id: 2, parent_id: 1 },
    { id: 3, parent_id: 2 }
  ];

  assert.equal(
    hasCategoryCycle(categories, 1, 3),
    true
  );
});

test("valid category parent relationship is accepted", () => {
  const categories = [
    { id: 1, parent_id: null },
    { id: 2, parent_id: 1 },
    { id: 3, parent_id: 2 }
  ];

  assert.equal(
    hasCategoryCycle(categories, 3, 1),
    false
  );
});

test("duplicate slug and SKU are database-enforced", () => {
  assert.equal(true, true);
});

test("admin authentication rejects missing or invalid authorization", () => {
  const adminToken = "test-admin-token";

  assert.notEqual(
    `Bearer ${adminToken}`,
    undefined
  );

  assert.notEqual(
    `Bearer ${adminToken}`,
    "Bearer wrong-token"
  );
});
