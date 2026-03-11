const { Competitor, Category, Run, Score, ScoreDetail, Criterion } = require("../models");

// GET /competitors
async function index(req, res) {
  try {
    const competitors = await Competitor.findAll({
      include: {
        model: Category,
        as: "category",
      },
    });

    return res.json(competitors);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching competitors" });
  }
}

// GET /competitors/:id
async function show(req, res) {
  try {
    const { id } = req.params;

    const competitor = await Competitor.findByPk(id, {
      include: {
        model: Category,
        as: "category",
      },
    });

    if (!competitor) {
      return res.status(404).json({ message: "Competitor not found" });
    }

    return res.json(competitor);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching competitor" });
  }
}

// POST /competitors
async function store(req, res) {
  try {
    const { firstname, lastname, category_id } = req.body;

    const competitor = await Competitor.create({
      firstname,
      lastname,
      category_id,
    });

    return res.status(201).json(competitor);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating competitor" });
  }
}

// PATCH /competitors/:id
async function update(req, res) {
  try {
    const { id } = req.params;

    const competitor = await Competitor.findByPk(id);

    if (!competitor) {
      return res.status(404).json({ message: "Competitor not found" });
    }

    await competitor.update(req.body);

    return res.json(competitor);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating competitor" });
  }
}

// DELETE /competitors/:id
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const competitor = await Competitor.findByPk(id);

    if (!competitor) {
      return res.status(404).json({ message: "Competitor not found" });
    }

    await competitor.destroy();

    return res.status(200).json({
      message: "Competitor deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting competitor" });
  }
}

async function getCategoryCompetitors(req, res) {
  try {
    const { id } = req.params;

    const competitors = await Competitor.findAll({
      where: { category_id: id },
    });

    return res.json(competitors);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching competitors",
    });
  }
}

// GET /competitors/:id/results
async function getCompetitorResults(req, res) {
  try {
    const { id } = req.params;

    const competitor = await Competitor.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        {
          model: Run,
          as: "runs",
          include: [
            {
              model: Score,
              as: "scores",
              include: [
                {
                  model: ScoreDetail,
                  as: "scoreDetails",
                  include: [{ model: Criterion, as: "criterion" }],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!competitor) {
      return res.status(404).json({ message: "Competitor not found" });
    }

    const runsResults = [];

    for (const run of competitor.runs) {
      let score = 0;

      const judgeCount = run.scores?.length || 0;

      for (const scoreEntry of run.scores) {
        for (const detail of scoreEntry.scoreDetails) {
          score += parseFloat(detail.value);
        }
      }

      let criteria = [];

      if (run.scores.length > 0) {
        criteria = run.scores[0].scoreDetails.map((detail) => detail.criterion);
      }

      const criteriaCount = criteria.length;

      const maxCriteriaScore = criteria.reduce((sum, c) => sum + Number(c?.max_score || 0), 0);

      const maxScore = maxCriteriaScore * judgeCount;

      const normalizedScore = maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(2)) : 0;

      runsResults.push({
        runId: run.id,
        score,
        maxScore,
        judgeCount,
        criteriaCount,
        normalizedScore,
      });
    }

    let bestRun = null;

    if (runsResults.length > 0) {
      bestRun = runsResults.reduce((best, current) =>
        current.score > best.score ? current : best,
      );
    }

    return res.json({
      competitor: {
        id: competitor.id,
        firstname: competitor.firstname,
        lastname: competitor.lastname,
        category: competitor.category
          ? {
              id: competitor.category.id,
              name: competitor.category.name,
            }
          : null,
      },

      totalRuns: runsResults.length,

      runs: runsResults,

      bestRun,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
  getCategoryCompetitors,
  getCompetitorResults,
};
