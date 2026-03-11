const express = require("express");
const router = express.Router();
const criterionController = require("../controllers/criterionController");

router.get("/", criterionController.index);
router.post("/", criterionController.store);
router.get("/:id", criterionController.show);
router.patch("/:id", criterionController.update);
router.delete("/:id", criterionController.destroy);

module.exports = router;
