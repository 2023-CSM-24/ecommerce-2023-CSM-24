const express = require("express");
const pool = require("../db");
const requireAdmin = require("../middleware/adminAuth");

const router = express.Router();

// Create a product
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      category_id,
      name,
      slug,
      description,
      status
    } = req.body;

    if (!category_id || !name || !slug) {
      return res.status(400).json({
        error: "category_id, name and slug are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO products
       (category_id, name, slug, description, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        category_id,
        name,
        slug,
        description || null,
        status || "draft"
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        error: "Product slug already exists"
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        error: "Category does not exist"
      });
    }

    res.status(500).json({
      error: "Failed to create product"
    });
  }
});

// List products
router.get("/", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         p.*,
         c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       ORDER BY p.id`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve products"
    });
  }
});

// Update a product
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      slug,
      description,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET category_id = COALESCE($1, category_id),
           name = COALESCE($2, name),
           slug = COALESCE($3, slug),
           description = COALESCE($4, description),
           status = COALESCE($5, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        category_id,
        name,
        slug,
        description,
        status,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        error: "Product slug already exists"
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        error: "Category does not exist"
      });
    }

    res.status(500).json({
      error: "Failed to update product"
    });
  }
});

// Deactivate a product
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE products
       SET status = 'inactive',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    res.json({
      message: "Product deactivated",
      product: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to deactivate product"
    });
  }
});

module.exports = router;
