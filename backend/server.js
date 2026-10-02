const express = require("express");
const categoriesRouter = require("./routes/categories");
const productsRouter = require("./routes/products");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "E-Commerce Sprint 2 Backend is running"
  });
});

app.use("/api/v1/admin/categories", categoriesRouter);
app.use("/api/v1/admin/products", productsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
