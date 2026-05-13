import express from "express";

const app = express();

app.get("/", (_req: any, res: any) => {
  res.send("Paikari69BD Live");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server Running");
});
