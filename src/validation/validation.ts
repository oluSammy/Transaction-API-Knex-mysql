import Joi from "joi";

export const validateSignup = (obj: Record<string, any>) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .error(() => new Error("Email is invalid"))
      .error(() => new Error("email is required")),
    username: Joi.string().required(),
    password: Joi.string()
      .min(6)
      .error(() => new Error("min character is 6"))
      .required()
      .error(() => new Error("password is required")),
  });

  return schema.validate(obj);
};

export const validateLogin = (obj: Record<string, any>) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .error(() => new Error("Email is invalid"))
      .error(() => new Error("email is required")),
    password: Joi.string()
      .min(6)
      .error(() => new Error("min character is 6"))
      .required()
      .error(() => new Error("password is required")),
  });

  return schema.validate(obj);
};
