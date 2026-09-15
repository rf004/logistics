const mongoose = require('mongoose');

const validateFarmId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid Farm ID'
    });
  }
  next();
};

module.exports = {
  validateFarmId
};
