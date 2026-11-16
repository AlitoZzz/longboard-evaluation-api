const {
  Competitor,
  Category,
  Run,
  Score,
  ScoreDetail,
  Criterion,
  Competition,
  User,
  sequelize,
} = require("../models");

const calculateRunResult = require("../utils/claculateRunResults");

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
    return res.status(500).json({
      message: "Error fetching competitors",
    });
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
      return res.status(404).json({
        message: "Competitor not found",
      });
    }

    return res.json(competitor);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching competitor",
    });
  }
}

// POST /competitors
async function store(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { firstname, lastname, category_id } = req.body;

    const category = await Category.findByPk(category_id, {
      include: [
        {
          model: Competition,
          as: "competition",
        },
        {
          model: Criterion,
          as: "criteria",
          attributes: ["id"],
        },
        {
          model: User,
          as: "judges",
          attributes: ["id"],
        },
      ],
      transaction: transaction,
    });

    if (!category) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (category.status === "completed") {
      await transaction.rollback();

      return res.status(400).json({
        message: "Cannot register a competitor in a completed category",
      });
    }

    if (category.status === "draft") {
      if (category.criteria.length === 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: "Category must have at least one criterion",
        });
      }

      if (category.judges.length === 0) {
        await transaction.rollback();

        return res.status(400).json({
          message: "La categoría debe tener al menos un juez asignado.",
        });
      }
    }

    const competitor = await Competitor.create(
      {
        firstname,
        lastname,
        category_id,
      },
      { transaction: transaction },
    );

    if (category.status === "draft") {
      await category.update(
        {
          status: "active",
        },
        { transaction: transaction },
      );

      if (category.competition.status === "draft") {
        await category.competition.update(
          {
            status: "active",
          },
          { transaction: transaction },
        );
      }
    }

    const runs = [];

    for (let i = 1; i <= category.max_runs; i++) {
      runs.push({
        number: i,
        competitor_id: competitor.id,
      });
    }

    await Run.bulkCreate(runs, {
      transaction: transaction,
    });

    await transaction.commit();

    const competitorWithRuns = await Competitor.findByPk(competitor.id, {
      include: { association: "runs" },
    });

    return res.status(201).json(competitorWithRuns);
  } catch (error) {
    await transaction.rollback();

    console.error(error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Invalid competitor data",
      });
    }

    return res.status(500).json({
      message: "Error creating competitor",
    });
  }
}

// PATCH /competitors/:id
async function update(req, res) {
  try {
    const { id } = req.params;
    const { firstname, lastname } = req.body;

    const competitor = await Competitor.findByPk(id);

    if (!competitor) {
      return res.status(404).json({
        message: "Competitor not found",
      });
    }

    await competitor.update({
      firstname,
      lastname,
    });

    return res.json(competitor);
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Invalid competitor data",
      });
    }

    return res.status(500).json({
      message: "Error updating competitor",
    });
  }
}

// DELETE /competitors/:id
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const competitor = await Competitor.findByPk(id);

    if (!competitor) {
      return res.status(404).json({
        message: "Competitor not found",
      });
    }

    await competitor.destroy();

    return res.status(200).json({
      message: "Competitor deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error deleting competitor",
    });
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
      return res.status(404).json({
        message: "Competitor not found",
      });
    }

    const runsResults = competitor.runs.map((run) => {
      const { finalScore, judgeCount } = calculateRunResult(run.scores);

      return {
        run_id: run.id,
        run_number: run.number,
        final_score: Number(finalScore.toFixed(2)),
        judge_count: judgeCount,
      };
    });

    let bestRun = null;

    if (runsResults.length > 0) {
      bestRun = runsResults.reduce((best, current) =>
        current.final_score > best.final_score ? current : best,
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

      total_runs: runsResults.length,

      runs: runsResults,

      best_run: bestRun,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
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
