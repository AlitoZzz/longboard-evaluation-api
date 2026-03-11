const express = require("express");
const router = express.Router();
const competitionController = require("../controllers/competitionController");
const categoryController = require("../controllers/categoryController");

router.get("/", competitionController.index);
router.post("/", competitionController.store);
router.get("/:id", competitionController.show);
router.patch("/:id", competitionController.update);
router.delete("/:id", competitionController.destroy);
router.get("/:id/categories", categoryController.getCompetitionCategories);

module.exports = router;
