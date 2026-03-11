const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const competitorController = require("../controllers/competitorController");
const criterionController = require("../controllers/criterionController");
const runController = require("../controllers/runController");

router.get("/", categoryController.index);
router.post("/", categoryController.store);
router.get("/:id", categoryController.show);
router.patch("/:id", categoryController.update);
router.delete("/:id", categoryController.destroy);
router.get("/:id/competitors", competitorController.getCategoryCompetitors);
router.get("/:id/criteria", criterionController.getCategoryCriteria);
router.get("/:id/runs", runController.getCategoryRuns);
router.get("/:id/ranking", categoryController.getRanking);

module.exports = router;
