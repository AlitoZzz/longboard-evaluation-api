const express = require("express");
const router = express.Router();
const competitionController = require("../controllers/competitionController");
const categoryController = require("../controllers/categoryController");
const userController = require("../controllers/userController");
const adminRequired = require("../middlewares/requireAdmin");
const requireCompetitionOwnership = require("../middlewares/requireCompetitionOwnership");

router.get("/", competitionController.index);
router.post("/", adminRequired, competitionController.store);
router.get("/:id", competitionController.show);
router.patch("/:id", adminRequired, requireCompetitionOwnership, competitionController.update);
router.delete("/:id", adminRequired, requireCompetitionOwnership, competitionController.destroy);
router.get("/:id/categories", categoryController.getCompetitionCategories);
router.patch(
  "/:competitionId/judges/:judgeId/categories",
  adminRequired,
  requireCompetitionOwnership,
  userController.setJudgeCategories,
);
// GET /competitions/:id/judges
router.get(
  "/:id/judges",
  adminRequired,
  requireCompetitionOwnership,
  userController.getCompetitionJudges,
);
module.exports = router;
