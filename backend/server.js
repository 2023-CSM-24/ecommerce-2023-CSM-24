const express = require("express");
const categoriesRouter = require("./categories");
const productsRouter = require("./product");
const variantsRouter = require("./variant");
const skusRouter = require("./sku");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "E-Commerce Sprint 2 Backend is running"
  });
});

app.use("/api/v1/admin/categories", categoriesRouter);
app.use("/api/v1/admin/products", productsRouter);
app.use("/api/v1/admin/variants", variantsRouter);
app.use("/api/v1/admin/skus", skusRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
