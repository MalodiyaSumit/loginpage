const Joi = require('joi');

// Password must have: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const signupSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
      'any.required': 'Password is required'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));

      return res.status(400).json({
        message: 'Validation failed',
        errors
      });
    }

    req.body = value; // Use sanitized values
    next();
  };
};

module.exports = {
  validateSignup: validate(signupSchema),
  validateLogin: validate(loginSchema)
};
