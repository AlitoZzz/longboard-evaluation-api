const express = require("express");
const router = express.Router();
const competitorController = require("../controllers/competitorController");
const runController = require("../controllers/runController");
const adminRequired = require("../middlewares/requireAdmin");

router.get("/", competitorController.index);
router.post("/", adminRequired, competitorController.store);
router.get("/:id", competitorController.show);
router.patch("/:id", adminRequired, competitorController.update);
router.delete("/:id", adminRequired, competitorController.destroy);
router.get("/:id/runs", runController.getCompetitorRuns);
router.get("/:id/results", competitorController.getCompetitorResults);

module.exports = router;
