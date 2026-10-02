ecommerce-2023# E-Commerce System

Sprint 2: Catalog Data Foundation

1. Sprint Goal & Scope

Sprint 2 focuses on building the database foundation for the product catalog. It extends the architecture created in Sprint 1 by adding categories, products, variants, and SKUs.

The main goal is to store product information, prices, stock, and product relationships in a proper structure that can be used by the future storefront, cart, and checkout system.

In Scope

* Category management
* Product creation and editing
* Product variants
* SKU management
* Price and stock management
* Basic administrator access
* Database constraints and migrations
* Seed/sample data
* Automated testing

Out of Scope

The following features are planned for Sprint 3 or later:

* Public product search
* Dynamic product specifications
* Image/asset upload
* Payment gateway
* Order placement
* Shipping integration
* Complete checkout flow

---

2. Link to Sprint 1 Decisions

Sprint 2 continues the decisions made in Sprint 1.

Technology Stack

Frontend: React.js

Backend: Node.js with Express.js

Database: PostgreSQL

Sprint 2 extends the Sprint 1 database design by adding catalog entities. The existing Users, Cart, Cart_Items, Orders, and Order_Items entities will continue to be used.

The new catalog structure will make it easier for future sprints to use products and SKUs in the cart and checkout system.

---

3. Updated Entity-Relationship Diagram (ERD)

The Sprint 2 ERD extends the Sprint 1 design with Categories, Products, Variants, SKUs, and Assets.

erDiagram

    USERS ||--o{ ORDERS : places
    USERS ||--|| CART : owns
    CATEGORIES ||--o{ PRODUCTS : contains
    PRODUCTS ||--o{ VARIANTS : has
    VARIANTS ||--o{ SKUS : materializes
    PRODUCTS ||--o{ ASSETS : displays
    CART ||--o{ CART_ITEMS : contains
    PRODUCTS ||--o{ CART_ITEMS : selected_as
    ORDERS ||--|{ ORDER_ITEMS : contains
    SKUS ||--o{ ORDER_ITEMS : sold_as

    USERS {
        INTEGER id PK
        VARCHAR email
        VARCHAR password_hash
    }

    CATEGORIES {
        INTEGER id PK
        INTEGER parent_id FK
        VARCHAR name
        VARCHAR slug
        BOOLEAN active
        TIMESTAMP created_at
    }

    PRODUCTS {
        INTEGER id PK
        INTEGER category_id FK
        VARCHAR name
        VARCHAR slug
        TEXT description
        VARCHAR status
        TIMESTAMP created_at
    }

    VARIANTS {
        INTEGER id PK
        INTEGER product_id FK
        VARCHAR option_values
    }

    SKUS {
        INTEGER id PK
        INTEGER variant_id FK
        VARCHAR sku_code
        DECIMAL price
        INTEGER stock_quantity
        BOOLEAN active
    }

    ASSETS {
        INTEGER id PK
        INTEGER product_id FK
        VARCHAR url
        VARCHAR role
        VARCHAR alt_text
        INTEGER sort_order
    }

    CART {
        INTEGER id PK
        INTEGER user_id FK
    }

    CART_ITEMS {
        INTEGER id PK
        INTEGER cart_id FK
        INTEGER product_id FK
        INTEGER quantity
    }

    ORDERS {
        INTEGER id PK
        INTEGER user_id FK
        DECIMAL total_amount
        VARCHAR status
        TIMESTAMP created_at
    }

    ORDER_ITEMS {
        INTEGER id PK
        INTEGER order_id FK
        INTEGER product_id FK
        INTEGER quantity
        DECIMAL unit_price
    }

Relationships

* One user can place many orders (1:N).
* One user has one cart (1:1).
* One category can contain many products (1:N).
* One product can have many variants (1:N).
* One variant can have many SKUs (1:N).
* One product can have many assets (1:N).
* One cart can contain many cart items (1:N).
* One product can appear in many cart items (1:N).
* One order can contain many order items (1:N).
* One SKU can appear in many order items (1:N).

Data Dictionary

Entity| Main Fields| Purpose
Categories| id, parent_id, name, slug, active| Stores categories and subcategories
Products| id, category_id, name, slug, description, status| Stores product information
Variants| id, product_id, option_values| Stores different product options
SKUs| id, variant_id, sku_code, price, stock_quantity, active| Stores sellable product units
Assets| id, product_id, url, role, alt_text| Stores product images or media

---

4. Data Integrity Rules

The database should protect important product information.

Category Rules

* Every category has a unique slug.
* A category can have an optional parent category.
* A category cannot become its own parent or ancestor.

Product Rules

* Every product has a name and slug.
* Product slugs must be unique.
* A product is assigned to a category.
* A product can have a draft or active status.

SKU Rules

* Every SKU has a unique SKU code.
* Every SKU has its own price and stock quantity.
* Stock quantity cannot be negative.
* Price should use a decimal representation instead of floating-point values.

Variant Rules

* A product can have multiple variants.
* Only valid variant combinations should be stored.
* An unavailable combination should not be created as a fake or zero-stock SKU.

---

5. Administration

The system will provide basic administration features for managing the catalog.

An authenticated administrator will be able to:

* Create categories.
* Update categories.
* View categories.
* Deactivate categories.
* Create products.
* Update products.
* View products.
* Add SKUs.
* Update SKU price and stock.
* Activate or deactivate SKUs.

Normal users should not be allowed to perform administrative operations.

Administration API Routes

Method| Route| Purpose
POST| "/api/v1/admin/products"| Create a product
PATCH| "/api/v1/admin/products/:id"| Update product
POST| "/api/v1/admin/products/:id/skus"| Add a SKU
PATCH| "/api/v1/admin/skus/:id"| Update SKU
GET| "/api/v1/admin/products"| View products
POST| "/api/v1/admin/categories"| Create category
GET| "/api/v1/admin/categories"| View category tree

All administrative routes will require authentication and administrator authorization.

---

6. Seed Data

Sample data will be used to demonstrate the catalog structure.

The planned seed data includes:

Categories

1. Electronics
2. Computer Accessories

A category can also contain a subcategory to demonstrate the category tree.

Products

1. Wireless Headphones
2. Mechanical Keyboard
3. Fast Charger

SKUs

At least four SKUs will be created for the sample products.

At least one product will have multiple variants.

One unavailable variant combination will also be demonstrated.

The seed data should be reproducible so that the same sample database can be created again.

---

7. Business Rules and Edge Cases

Draft Products

A draft product can exist without a sellable SKU while it is being prepared.

A published product should have at least one sellable SKU before it is made available to customers.

Categories

Products will have one main category. This keeps the catalog structure simple and easy to manage.

If a parent category is deactivated, its child categories should also be checked before being displayed as active.

Out-of-Stock Products

An out-of-stock SKU remains in the database, but its stock quantity is set to zero and it should not be available for purchase.

SKU Prices

Different SKUs can have the same price. A SKU can also have its own price because different variants may have different prices.

Negative Stock

Negative stock is not allowed. Database constraints and validation should prevent stock from becoming negative.

Deactivated Products

A deactivated product should not be available for new purchases, but its existing references in carts or orders should not be removed automatically.

---

8. Testing Strategy

Automated tests should be used to check the important catalog rules.

The planned tests include:

* Product creation with required fields.
* SKU creation with required fields.
* Duplicate product slug rejection.
* Duplicate SKU code rejection.
* Category hierarchy validation.
* Category cycle prevention.
* Negative stock rejection.
* Variant and SKU combination validation.
* Unauthorized administrative request rejection.

The final implementation should record the actual test command and result when the backend is implemented.

---

9. 15-Day Work Plan

Days| Work
1–3| Repository setup and database migrations
4–6| Categories and product management
7–9| Variants and SKUs
10–12| Administration and seed data
13–14| Testing and documentation
15| Sprint review and Sprint 3 hand-off

---

10. Known Limitations and Sprint 3 Backlog

Sprint 2 does not include:

* Dynamic product specifications
* Asset/image upload
* Public catalog search
* Publication workflows
* Payment gateway integration
* Shipping integration
* Complete checkout

These features can be developed in Sprint 3 or later.

Sprint 3 should use the catalog and SKU structure created in Sprint 2 instead of creating duplicate product or pricing information.

---

Conclusion

Sprint 2 extends our Sprint 1 e-commerce system by creating a stronger product catalog structure.

It introduces categories, products, variants, SKUs, assets, administration rules, data integrity rules, seed data, and testing requirements.

This catalog foundation will be used in future sprints for the public storefront, cart, and checkout system.
