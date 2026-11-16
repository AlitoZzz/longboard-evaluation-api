const express = require("express");
const router = express.Router();
const competitorController = require("../controllers/competitorController");
const runController = require("../controllers/runController");
const adminRequired = require("../middlewares/requireAdmin");
const { Category, Competition, Competitor } = require("../models");

const requireOwnership = require("../middlewares/requireOwnership");

const requireCompetitorCategoryOwnership = requireOwnership(async (req) => {
  const category = await Category.findByPk(req.body.category_id, {
    include: {
      model: Competition,
      as: "competition",
      attributes: ["id", "admin_id"],
    },
  });

  return category?.competition;
});

const requireCompetitorOwnership = requireOwnership(async (req) => {
  const competitor = await Competitor.findByPk(req.params.id, {
    include: {
      model: Category,
      as: "category",
      include: {
        model: Competition,
        as: "competition",
        attributes: ["id", "admin_id"],
      },
    },
  });

  return competitor?.category?.competition;
});

router.get("/", competitorController.index);
router.post("/", adminRequired, requireCompetitorCategoryOwnership, competitorController.store);
router.get("/:id", competitorController.show);
router.patch("/:id", adminRequired, requireCompetitorOwnership, competitorController.update);
router.delete("/:id", adminRequired, requireCompetitorOwnership, competitorController.destroy);
router.get("/:id/runs", runController.getCompetitorRuns);
router.get("/:id/results", competitorController.getCompetitorResults);

module.exports = router;
