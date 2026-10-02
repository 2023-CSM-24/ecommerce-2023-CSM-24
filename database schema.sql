-- Sprint 2: Catalog Data Foundation
-- PostgreSQL schema

-- =========================
-- CATEGORIES
-- =========================

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES categories(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    active_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT category_not_own_parent
        CHECK (parent_id IS NULL OR parent_id <> id)
);


-- =========================
-- PRODUCTS
-- =========================

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT product_status_check
        CHECK (status IN ('draft', 'active', 'inactive'))
);


-- =========================
-- VARIANTS
-- =========================

CREATE TABLE variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    option_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- SKUS
-- =========================

CREATE TABLE skus (
    id SERIAL PRIMARY KEY,
    variant_id INTEGER NOT NULL REFERENCES variants(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    sku_code VARCHAR(100) NOT NULL UNIQUE,
    price NUMERIC(12,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    active_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT sku_price_non_negative
        CHECK (price >= 0),

    CONSTRAINT sku_stock_non_negative
        CHECK (stock_quantity >= 0)
);


-- =========================
-- ASSETS
-- =========================

CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    variant_id INTEGER REFERENCES variants(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    storage_key VARCHAR(500) NOT NULL,
    role VARCHAR(50),
    alt_text VARCHAR(255),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- CART ITEMS
-- Connection to Sprint 1
-- =========================

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL,
    sku_id INTEGER NOT NULL REFERENCES skus(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    quantity INTEGER NOT NULL,

    CONSTRAINT cart_item_quantity_positive
        CHECK (quantity > 0)
);


-- =========================
-- ORDER ITEMS
-- Connection to Sprint 1
-- =========================

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    sku_id INTEGER NOT NULL REFERENCES skus(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,

    CONSTRAINT order_item_quantity_positive
        CHECK (quantity > 0),

    CONSTRAINT order_item_price_non_negative
        CHECK (unit_price >= 0)
);
