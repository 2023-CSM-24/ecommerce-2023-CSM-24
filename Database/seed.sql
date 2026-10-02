-- Sprint 2 Seed Data

-- Categories
INSERT INTO categories (name, slug, parent_id)
VALUES
('Electronics', 'electronics', NULL),
('Laptops', 'laptops', 1)
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO products
(category_id, name, slug, description, status)
VALUES
(1, 'Wireless Headphones', 'wireless-headphones',
 'Bluetooth wireless headphones', 'active'),
(2, 'Business Laptop', 'business-laptop',
 'Laptop for business and study', 'active'),
(1, 'Mechanical Keyboard', 'mechanical-keyboard',
 'Mechanical keyboard for desktop users', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Variants for Wireless Headphones
INSERT INTO variants (product_id, option_values)
VALUES
(1, '{"color": "Black"}'),
(1, '{"color": "White"}');

-- Variants for Business Laptop
INSERT INTO variants (product_id, option_values)
VALUES
(2, '{"ram": "8GB", "storage": "256GB"}'),
(2, '{"ram": "16GB", "storage": "512GB"}');

-- Variant for Mechanical Keyboard
INSERT INTO variants (product_id, option_values)
VALUES
(3, '{"switch": "Red"}');

-- SKUs
INSERT INTO skus
(variant_id, sku_code, price, stock_quantity, active_status)
VALUES
(1, 'WH-BLK-001', 49.99, 20, TRUE),
(2, 'WH-WHT-001', 49.99, 15, TRUE),
(3, 'LAP-8-256-001', 699.99, 10, TRUE),
(4, 'LAP-16-512-001', 999.99, 8, TRUE);
