import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes";
import errorHandler from "./middleware/errorHandler";
import { PrismaClient } from "@prisma/client";

dotenv.config();

export const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
