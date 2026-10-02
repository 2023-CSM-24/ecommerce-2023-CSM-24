const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "E-Commerce Sprint 2 Backend is running"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
