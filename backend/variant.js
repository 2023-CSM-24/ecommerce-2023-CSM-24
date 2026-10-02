const express = require("express");
const pool = require("../db");
const requireAdmin = require("../middleware/adminAuth");

const router = express.Router();

// Create a variant
router.post("/", requireAdmin, async (req, res) => {
  try {
    const { product_id, option_values } = req.body;

    if (!product_id) {
      return res.status(400).json({
        error: "product_id is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO variants (product_id, option_values)
       VALUES ($1, $2)
       RETURNING *`,
      [
        product_id,
        option_values || {}
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        error: "Product does not exist"
      });
    }

    res.status(500).json({
      error: "Failed to create variant"
    });
  }
});

// List variants
router.get("/", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         v.*,
         p.name AS product_name
       FROM variants v
       JOIN products p ON p.id = v.product_id
       ORDER BY v.id`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve variants"
    });
  }
});

// Update a variant
router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, option_values } = req.body;

    const result = await pool.query(
      `UPDATE variants
       SET product_id = COALESCE($1, product_id),
           option_values = COALESCE($2, option_values),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [product_id, option_values, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Variant not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        error: "Product does not exist"
      });
    }

    res.status(500).json({
      error: "Failed to update variant"
    });
  }
});

// Delete a variant
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM variants
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Variant not found"
      });
    }

    res.json({
      message: "Variant deleted",
      variant: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete variant"
    });
  }
});

module.exports = router;
