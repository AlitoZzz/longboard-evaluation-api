const express = require("express");
const router = express.Router();
const criterionController = require("../controllers/criterionController");
const adminRequired = require("../middlewares/requireAdmin");
const { Category, Competition, Criterion } = require("../models");
const requireOwnership = require("../middlewares/requireOwnership");

const requireCriterionCategoryOwnership = requireOwnership(async (req) => {
  const category = await Category.findByPk(req.body.category_id, {
    include: {
      model: Competition,
      as: "competition",
      attributes: ["id", "admin_id"],
    },
  });

  return category?.competition;
});

const requireCriterionOwnership = requireOwnership(async (req) => {
  const criterion = await Criterion.findByPk(req.params.id, {
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

  return criterion?.category?.competition;
});

router.get("/", criterionController.index);
router.post("/", adminRequired, requireCriterionCategoryOwnership, criterionController.store);
router.get("/:id", criterionController.show);
router.patch("/:id", adminRequired, requireCriterionOwnership, criterionController.update);
router.delete("/:id", adminRequired, requireCriterionOwnership, criterionController.destroy);

module.exports = router;
