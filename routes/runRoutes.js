const express = require("express");
const router = express.Router();
const runController = require("../controllers/runController");
const adminRequired = require("../middlewares/requireAdmin");

router.get("/", runController.index);
router.post("/", runController.store);
router.get("/:id", runController.show);
router.patch("/:id", adminRequired, runController.update);
router.delete("/:id", adminRequired, runController.destroy);
router.get("/:id/score-sheet", runController.getScoreSheet);
router.get("/:id/results", runController.getRunResults);

module.exports = router;
