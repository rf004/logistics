const ApiError = require('../utils/ApiError');

const validate = (validatorFn) => {
  return (req, res, next) => {
    const errors = validatorFn(req.body);
    if (errors && errors.length > 0) {
      return next(new ApiError(400, errors.join(', '), errors));
    }
    next();
  };
};

module.exports = validate;
