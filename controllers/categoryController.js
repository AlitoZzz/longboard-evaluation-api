const { Competition, Category, Competitor, Run, Score, ScoreDetail } = require("../models");

// GET /categories
async function index(req, res) {
  try {
    const categories = await Category.findAll({
      include: { model: Competition, as: "competition" },
    });

    return res.json(categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching categories" });
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
      return res.status(404).json({ message: "Category not found" });
    }

    return res.json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching category" });
  }
}

// POST /categories
async function store(req, res) {
  try {
    const { name, max_runs, competition_id, default_criterion_max_score } = req.body;

    const competition = await Competition.findByPk(competition_id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
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
    return res.status(500).json({ message: "Error creating category" });
  }
}

// PATCH /categories/:id
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, max_runs } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.update({
      name,
      max_runs,
    });

    return res.json(category);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating category" });
  }
}

// DELETE /categories/:id
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await category.destroy();

    return res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting category" });
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
      return res.status(404).json({ message: "Competition not found" });
    }

    return res.json(competition.categories);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching categories" });
  }
}

// GET /categories/:id/ranking
async function getRanking(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
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

    const ranking = category.competitors.map((competitor) => {
      const runTotals = competitor.runs.map((run) => {
        const judgeTotals = run.scores.map((score) =>
          score.scoreDetails.reduce((sum, detail) => sum + Number(detail.value), 0),
        );

        if (!judgeTotals.length) return 0;

        const runAverage = judgeTotals.reduce((sum, total) => sum + total, 0) / judgeTotals.length;

        return runAverage;
      });

      const bestRun = runTotals.length ? Math.max(...runTotals) : 0;

      return {
        competitor_id: competitor.id,
        competitor_name: `${competitor.firstname} ${competitor.lastname}`,
        best_run: bestRun,
      };
    });

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
};
