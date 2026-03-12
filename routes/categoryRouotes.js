const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const competitorController = require("../controllers/competitorController");
const criterionController = require("../controllers/criterionController");
const runController = require("../controllers/runController");
const adminRequired = require("../middlewares/requireAdmin");

router.get("/", categoryController.index);
router.post("/", adminRequired, categoryController.store);
router.get("/:id", categoryController.show);
router.patch("/:id", adminRequired, categoryController.update);
router.delete("/:id", adminRequired, categoryController.destroy);
router.get("/:id/competitors", competitorController.getCategoryCompetitors);
router.get("/:id/criteria", criterionController.getCategoryCriteria);
router.get("/:id/runs", runController.getCategoryRuns);
router.get("/:id/ranking", categoryController.getRanking);

module.exports = router;
