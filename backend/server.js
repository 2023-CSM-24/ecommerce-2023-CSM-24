const express = require("express");
const categoriesRouter = require("./routes/categories");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "E-Commerce Sprint 2 Backend is running"
  });
});

app.use("/api/v1/admin/categories", categoriesRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
