const express = require("express");

const router = express.Router();

const warehouseController = require("../controllers/warehouse.controller");
const validate = require("../middlewares/validation.middleware");
const { validateCreateWarehouse, validateUpdateWarehouse } = require("../validators/warehouse.validator");

router.post("/",validate(validateCreateWarehouse),warehouseController.create);

router.get("/",warehouseController.getAll);

router.get("/:id",warehouseController.getById);

router.put("/:id",validate(validateUpdateWarehouse),warehouseController.update);

router.delete("/:id",warehouseController.delete);

module.exports = router;
