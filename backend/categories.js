const express = require("express");
const pool = require("../db");
const requireAdmin = require("../middleware/adminAuth");

const router = express.Router();

// Create a category
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, slug, parent_id } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        error: "name and slug are required"
      });
    }

    const result = await pool.query(
      `INSERT INTO categories (name, slug, parent_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, slug, parent_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        error: "Category slug already exists"
      });
    }

    res.status(500).json({
      error: "Failed to create category"
    });
  }
});

// List categories
router.get("/", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM categories
       ORDER BY id`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve categories"
    });
  }
});

// Update a category
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, parent_id, active_status } = req.body;

    const result = await pool.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           parent_id = COALESCE($3, parent_id),
           active_status = COALESCE($4, active_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [name, slug, parent_id, active_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Category not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        error: "Category slug already exists"
      });
    }

    res.status(500).json({
      error: "Failed to update category"
    });
  }
});

// Deactivate a category
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE categories
       SET active_status = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Category not found"
      });
    }

    res.json({
      message: "Category deactivated",
      category: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to deactivate category"
    });
  }
});

module.exports = router;
