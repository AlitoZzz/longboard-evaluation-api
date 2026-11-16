const express = require("express");
const router = express.Router();
const runController = require("../controllers/runController");
const adminRequired = require("../middlewares/requireAdmin");
const { Run, Competitor, Category, Competition } = require("../models");

const requireOwnership = require("../middlewares/requireOwnership");

const requireRunOwnership = requireOwnership(async (req) => {
  const run = await Run.findByPk(req.params.id, {
    include: {
      model: Competitor,
      as: "competitor",
      include: {
        model: Category,
        as: "category",
        include: {
          model: Competition,
          as: "competition",
          attributes: ["id", "admin_id"],
        },
      },
    },
  });

  return run?.competitor?.category?.competition;
});

router.get("/", runController.index);
router.get("/active", runController.getActiveRun);
router.patch("/:id/complete", adminRequired, requireRunOwnership, runController.completeRun);
router.get("/:id", runController.show);
router.get("/:id/score-sheet", runController.getScoreSheet);
router.get("/:id/results", runController.getRunResults);
router.patch("/:id/start", adminRequired, requireRunOwnership, runController.startRun);
module.exports = router;
