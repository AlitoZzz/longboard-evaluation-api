const express = require("express");
const router = express.Router();
const criterionController = require("../controllers/criterionController");
const adminRequired = require("../middlewares/requireAdmin");

router.get("/", criterionController.index);
router.post("/", adminRequired, criterionController.store);
router.get("/:id", criterionController.show);
router.patch("/:id", adminRequired, criterionController.update);
router.delete("/:id", adminRequired, criterionController.destroy);

module.exports = router;
