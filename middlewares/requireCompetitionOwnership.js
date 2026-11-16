const { Competition } = require("../models");

async function requireCompetitionOwnership(req, res, next) {
  try {
    const id = req.params.competitionId ?? req.params.id;

    const competition = await Competition.findByPk(id);

    if (!competition) {
      return res.status(404).json({
        message: "Competition not found",
      });
    }

    if (Number(competition.admin_id) !== Number(req.auth.id)) {
      return res.status(403).json({
        message: "You do not have access to this competition",
      });
    }

    next();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error checking competition ownership",
    });
  }
}

module.exports = requireCompetitionOwnership;
