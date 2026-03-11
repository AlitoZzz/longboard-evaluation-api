const express = require("express");
const router = express.Router();
const competitorController = require("../controllers/competitorController");
const runController = require("../controllers/runController");

router.get("/", competitorController.index);
router.post("/", competitorController.store);
router.get("/:id", competitorController.show);
router.patch("/:id", competitorController.update);
router.delete("/:id", competitorController.destroy);
router.get("/:id/runs", runController.getCompetitorRuns);
router.get("/:id/results", competitorController.getCompetitorResults);

module.exports = router;
