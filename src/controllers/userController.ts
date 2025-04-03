import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { prisma } from "../server";
import { Prisma } from "@prisma/client";
import { ObjectId } from "mongodb";

// List Users with Pagination & Search
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search ? (req.query.search as string) : "";

    const whereCondition: Prisma.UserWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    // Fetch paginated users
    const users = await prisma.user.findMany({
      where: {
        ...whereCondition,
      },
      skip: (page - 1) * limit, // Skip previous pages
      take: limit, // Limit number of users
      orderBy: { createdAt: "desc" }, // Optional: Sort by newest first
    });

    // Count total users
    const totalUsers = await prisma.user.count({
      where: whereCondition,
    });

    res.json({
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// Get Single User
const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update User
const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next({ status: 400, message: errorMessages.join(", ") });
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json({ user });
  } catch (error: any) {
    return next(error); // Ensure next(error) is returned properly
  }
};

// Delete User
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.delete({
      where: { id: req.params.id },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Delete Multiple Users
const deleteUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userIds } = req.body; // Expect an array of user IDs in request body

    // Validate if userIds is an array and contains valid ObjectIds
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({ message: "Invalid user IDs" });
      return;
    }

    // Ensure all userIds are valid ObjectIds
    const invalidIds = userIds.filter((id: string) => !ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      res
        .status(400)
        .json({ message: `Invalid user ID(s): ${invalidIds.join(", ")}` });
      return;
    }

    // Delete users one by one
    let deletedCount = 0;
    for (const userId of userIds) {
      try {
        const user = await prisma.user.delete({
          where: {
            id: userId,
          },
        });
        if (user) {
          deletedCount++;
        }
      } catch (error) {
        // You can choose to log errors here or handle them differently
        console.error(`Failed to delete user with ID ${userId}`, error);
      }
    }

    if (deletedCount === 0) {
      res.status(404).json({ message: "No users found to delete" });
      return;
    }

    res.json({
      message: `${deletedCount} users deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return next({ status: 400, message: errorMessages.join(", ") });
  }

  try {
    const { name, email } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
      },
    });
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res.status(400).json({ message: "Email already exists" });
        return;
      }
    }
    next(error);
  }
};

// Export all functions
export default {
  getUsers,
  getUser,
  updateProfile,
  deleteUser,
  deleteUsers,
  createUser,
};
