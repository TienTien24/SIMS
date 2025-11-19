// app.js (từ app.js gốc, fix mount)
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import chalk from "chalk";
import mainRouter from "./routers/index.js";
import { requestLogger } from "./middlewares/requestLogger.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FE_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.use("/api", mainRouter);

app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Không tìm thấy API!" });
});

app.listen(PORT, () => {
  console.log(
    chalk.green.bold(`\nBackend SIMS is running on http://localhost:${PORT}`)
  );
  console.log(chalk.cyan(`Prisma connected to TiDB Cloud successfully`));
  console.log(
    chalk.magenta(
      `CORS allowed origin: ${process.env.FE_URL || "http://localhost:5173"}\n`
    )
  );
});
