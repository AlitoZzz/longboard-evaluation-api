const {
  Competition,
  Category,
  Competitor,
  Run,
  Score,
  ScoreDetail,
  User,
  sequelize,
} = require("../models");

const calculateRunResult = require("../utils/claculateRunResults");

// GET /categories
async function index(req, res) {
  try {
    const categories = await Category.findAll({
      include: { model: Competition, as: "competition" },
    });

    return res.json(categories);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching categories",
    });
  }
}

// GET /categories/:id
async function show(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: { model: Competition, as: "competition" },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.json(category);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching category",
    });
  }
}

// POST /categories
async function store(req, res) {
  try {
    const { name, max_runs, competition_id, default_criterion_max_score } = req.body;

    const competition = await Competition.findByPk(competition_id);

    if (!competition) {
      return res.status(404).json({
        message: "Competition not found",
      });
    }

    const category = await Category.create({
      name,
      max_runs,
      competition_id,
      default_criterion_max_score,
    });

    return res.status(201).json(category);
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Invalid category data",
      });
    }

    return res.status(500).json({
      message: "Error creating category",
    });
  }
}

// PATCH /categories/:id
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, max_runs } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (category.status === "active") {
      return res.status(400).json({
        message: "Cannot update an active category",
      });
    }

    if (category.status === "completed") {
      return res.status(400).json({
        message: "Cannot update a completed category",
      });
    }

    await category.update({
      name,
      max_runs,
    });

    return res.json(category);
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Invalid category data",
      });
    }

    return res.status(500).json({
      message: "Error updating category",
    });
  }
}

// PATCH /categories/:id/complete

// PATCH /categories/:id/complete
async function completeCategory(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      transaction,
    });

    if (!category) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (category.status === "draft") {
      await transaction.rollback();

      return res.status(400).json({
        message: "No se puede finalizar la categoría que todavía no comenzó",
      });
    }

    if (category.status === "completed") {
      await transaction.rollback();

      return res.status(400).json({
        message: "Category is already completed",
      });
    }

    const activeRun = await Run.findOne({
      where: {
        status: "active",
      },
      include: {
        model: Competitor,
        as: "competitor",
        where: {
          category_id: id,
        },
        attributes: ["id"],
      },
      transaction,
    });

    if (activeRun) {
      await transaction.rollback();

      return res.status(400).json({
        message: "No se puede finalizar la categoría mientras haya rondas en curso.",
      });
    }

    await category.update(
      {
        status: "completed",
      },
      { transaction },
    );

    const categories = await Category.findAll({
      where: {
        competition_id: category.competition_id,
      },
      attributes: ["status"],
      transaction,
    });

    const allCategoriesCompleted = categories.every((category) => category.status === "completed");

    if (allCategoriesCompleted) {
      await Competition.update(
        {
          status: "completed",
        },
        {
          where: {
            id: category.competition_id,
          },
          transaction,
        },
      );
    }

    await transaction.commit();

    return res.json({
      message: "Category completed successfully",
      category,
      competition_completed: allCategoriesCompleted,
    });
  } catch (error) {
    await transaction.rollback();

    console.error(error);

    return res.status(500).json({
      message: "Error completing category",
    });
  }
}

// DELETE /categories/:id
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    await category.destroy();

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error deleting category",
    });
  }
}

// GET /competition/:id/categories
async function getCompetitionCategories(req, res) {
  try {
    const { id } = req.params;

    const competition = await Competition.findByPk(id, {
      include: { model: Category, as: "categories" },
    });

    if (!competition) {
      return res.status(404).json({
        message: "Competition not found",
      });
    }

    return res.json(competition.categories);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching categories",
    });
  }
}

// GET /categories/:id/ranking
async function getRanking(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: User,
          as: "judges",
          attributes: ["id"],
        },
        {
          model: Competitor,
          as: "competitors",
          include: [
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
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const totalJudges = category.judges.length;

    if (totalJudges === 0) {
      return res.json({
        category_id: category.id,
        category_name: category.name,
        ranking: [],
      });
    }

    const ranking = category.competitors
      .map((competitor) => {
        const validRunResults = competitor.runs
          .map((run) => {
            const { finalScore, judgeCount } = calculateRunResult(run.scores);

            if (judgeCount !== totalJudges) {
              return null;
            }

            return finalScore;
          })
          .filter((score) => score !== null);

        if (validRunResults.length === 0) {
          return null;
        }

        const bestRun = Math.max(...validRunResults);

        return {
          competitor_id: competitor.id,
          competitor_name: `${competitor.firstname} ${competitor.lastname}`,
          best_run: Number(bestRun.toFixed(2)),
        };
      })
      .filter(Boolean);

    ranking.sort((a, b) => b.best_run - a.best_run);

    const rankingWithPosition = ranking.map((item, index) => ({
      position: index + 1,
      ...item,
    }));

    return res.json({
      category_id: category.id,
      category_name: category.name,
      ranking: rankingWithPosition,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error generating ranking",
    });
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
  getCompetitionCategories,
  getRanking,
  completeCategory,
};
