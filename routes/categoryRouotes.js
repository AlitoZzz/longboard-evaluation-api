const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const competitorController = require("../controllers/competitorController");
const criterionController = require("../controllers/criterionController");
const runController = require("../controllers/runController");
const adminRequired = require("../middlewares/requireAdmin");
const requireOwnership = require("../middlewares/requireOwnership");
const { Competition, Category } = require("../models");

const requireCategoryOwnership = requireOwnership(async (req) => {
  const category = await Category.findByPk(req.params.id, {
    include: {
      model: Competition,
      as: "competition",
      attributes: ["id", "admin_id"],
    },
  });

  return category?.competition;
});

const requireCategoryCompetitionOwnership = requireOwnership(async (req) => {
  return Competition.findByPk(req.body.competition_id);
});

router.get("/", categoryController.index);
router.post("/", adminRequired, requireCategoryCompetitionOwnership, categoryController.store);
router.get("/:id", categoryController.show);
router.patch("/:id", adminRequired, requireCategoryOwnership, categoryController.update);
router.delete("/:id", adminRequired, requireCategoryOwnership, categoryController.destroy);
router.get("/:id/competitors", competitorController.getCategoryCompetitors);
router.get("/:id/criteria", criterionController.getCategoryCriteria);
router.get("/:id/runs", runController.getCategoryRuns);
router.get("/:id/ranking", categoryController.getRanking);
router.patch(
  "/:id/complete",
  adminRequired,
  requireCategoryOwnership,
  categoryController.completeCategory,
);

module.exports = router;
