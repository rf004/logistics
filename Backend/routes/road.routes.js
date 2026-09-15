const express = require("express");

const router = express.Router();

const roadController = require("../controllers/road.controller");
const validate = require("../middlewares/validation.middleware");
const { validateCreateRoad, validateUpdateRoad } = require("../validators/road.validator");

router.post("/",validate(validateCreateRoad),roadController.create);

router.get("/",roadController.getAll);

router.get("/:id",roadController.getById);

router.put("/:id",validate(validateUpdateRoad),roadController.update);

router.delete("/:id",roadController.delete);

module.exports = router;
