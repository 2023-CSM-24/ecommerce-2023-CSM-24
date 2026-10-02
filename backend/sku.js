const express = require("express");
const pool = require("../db");
const requireAdmin = require("../middleware/adminAuth");

const router = express.Router();

// Create a SKU
router.post("/products/:productId/skus", requireAdmin, async (req, res) => {
  try {
    const { productId } = req.params;

    const {
      variant_id,
      sku_code,
      price,
      stock_quantity,
      active_status
    } = req.body;

    if (
      !productId ||
      !variant_id ||
      !sku_code ||
      price === undefined ||
      stock_quantity === undefined
    ) {
      return res.status(400).json({
        error: "productId, variant_id, sku_code, price and stock_quantity are required"
      });
    }

    const variantCheck = await pool.query(
      `SELECT id
       FROM variants
       WHERE id = $1 AND product_id = $2`,
      [variant_id, productId]
    );

    if (variantCheck.rows.length === 0) {
      return res.status(400).json({
        error: "Variant does not belong to the specified product"
      });
    }

    const result = await pool.query(
      `INSERT INTO skus
       (variant_id, sku_code, price, stock_quantity, active_status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        variant_id,
        sku_code,
        price,
        stock_quantity,
        active_status !== undefined ? active_status : true
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        error: "SKU code already exists"
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        error: "Variant does not exist"
      });
    }

    if (error.code === "23514") {
      return res.status(400).json({
        error: "Price and stock quantity must not be negative"
      });
    }

    res.status(500).json({
      error: "Failed to create SKU"
    });
  }
});

// List SKUs
router.get("/skus", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         s.*,
         v.product_id
       FROM skus s
       JOIN variants v ON v.id = s.variant_id
       ORDER BY s.id`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve SKUs"
    });
  }
});

// Update a SKU
router.patch("/skus/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const {
      price,
      stock_quantity,
      active_status
    } = req.body;

    const result = await pool.query(
      `UPDATE skus
       SET price = COALESCE($1, price),
           stock_quantity = COALESCE($2, stock_quantity),
           active_status = COALESCE($3, active_status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [
        price,
        stock_quantity,
        active_status,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "SKU not found"
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23514") {
      return res.status(400).json({
        error: "Price and stock quantity must not be negative"
      });
    }

    res.status(500).json({
      error: "Failed to update SKU"
    });
  }
});

// Deactivate a SKU
router.delete("/skus/:id", requireAdmin, async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE skus
       SET active_status = FALSE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "SKU not found"
      });
    }

    res.json({
      message: "SKU deactivated",
      sku: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to deactivate SKU"
    });
  }
});

module.exports = router;
