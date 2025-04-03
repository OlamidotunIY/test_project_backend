import { body, check } from "express-validator";

const updateProfileValidation = [
  body().custom((value, { req }) => {
    let allowedFields = ["name", "bio", "profilePicture"];
    for (let key in req.body) {
      if (!allowedFields.includes(key)) {
        throw new Error(`${key} Can not be updated`);
      }
    }
    return true;
  }),
];

const createUserValidation = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Email is required"),
  check("bio").optional().isString().withMessage("Bio must be a string"),
  check("profilePicture")
    .optional()
    .isString()
    .withMessage("Profile picture must be a string"),
];

export default {
  updateProfileValidation,
  createUserValidation,
};
