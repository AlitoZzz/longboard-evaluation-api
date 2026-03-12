const express = require("express");
const router = express.Router();
const competitionController = require("../controllers/competitionController");
const categoryController = require("../controllers/categoryController");
const adminRequired = require("../middlewares/requireAdmin");

router.get("/", competitionController.index);
router.post("/", adminRequired, competitionController.store);
router.get("/:id", competitionController.show);
router.patch("/:id", adminRequired, competitionController.update);
router.delete("/:id", adminRequired, competitionController.destroy);
router.get("/:id/categories", categoryController.getCompetitionCategories);

module.exports = router;
