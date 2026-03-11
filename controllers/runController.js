const { Run, Competitor, Category, Score, ScoreDetail, User, Criterion } = require("../models");

// GET /runs
async function index(req, res) {
  try {
    const runs = await Run.findAll({
      include: {
        model: Competitor,
        as: "competitor",
      },
    });

    return res.json(runs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching runs",
    });
  }
}

// GET /runs/:id
async function show(req, res) {
  try {
    const { id } = req.params;

    const run = await Run.findByPk(id, {
      include: {
        model: Competitor,
        as: "competitor",
      },
    });

    if (!run) {
      return res.status(404).json({
        message: "Run not found",
      });
    }

    return res.json(run);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching run",
    });
  }
}

// POST /runs
async function store(req, res) {
  try {
    const { competitor_id, number } = req.body;

    const competitor = await Competitor.findByPk(competitor_id);

    if (!competitor) {
      return res.status(404).json({
        message: "Competitor not found",
      });
    }

    const run = await Run.create({
      competitor_id,
      number,
    });

    return res.status(201).json(run);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error creating run",
    });
  }
}

// PATCH /runs/:id
async function update(req, res) {
  try {
    const { id } = req.params;

    const run = await Run.findByPk(id);

    if (!run) {
      return res.status(404).json({
        message: "Run not found",
      });
    }

    await run.update(req.body);

    return res.json(run);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error updating run",
    });
  }
}

// DELETE /runs/:id
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const run = await Run.findByPk(id);

    if (!run) {
      return res.status(404).json({
        message: "Run not found",
      });
    }

    await run.destroy();

    return res.status(200).json({
      message: "Run deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error deleting run",
    });
  }
}

// GET /competitors/:id/runs
async function getCompetitorRuns(req, res) {
  try {
    const { id } = req.params;

    const runs = await Run.findAll({
      where: { competitor_id: id },
      include: {
        model: Competitor,
        as: "competitor",
      },
    });

    return res.json(runs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching competitor runs",
    });
  }
}

// GET /categories/:id/runs
async function getCategoryRuns(req, res) {
  try {
    const { id } = req.params;

    const runs = await Run.findAll({
      include: {
        model: Competitor,
        as: "competitor",
        where: { category_id: id },
        include: {
          model: Category,
          as: "category",
        },
      },
    });

    return res.json(runs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching category runs",
    });
  }
}

// GET /runs/:id/score-sheet
async function getScoreSheet(req, res) {
  try {
    const { id } = req.params;

    const run = await Run.findByPk(id, {
      include: [
        {
          model: Competitor,
          as: "competitor",
          include: [
            {
              model: Category,
              as: "category",
              include: [
                {
                  model: Criterion,
                  as: "criteria",
                },
              ],
            },
          ],
        },
      ],
    });

    if (!run) {
      return res.status(404).json({
        message: "Run not found",
      });
    }

    const category = run.competitor.category;

    return res.json({
      run_id: run.id,
      competitor: {
        id: run.competitor.id,
        name: run.competitor.name,
      },
      category: {
        id: category.id,
        name: category.name,
      },
      criteria: category.criteria.map((c) => ({
        id: c.id,
        name: c.name,
        max_value: c.max_value,
      })),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching score sheet",
    });
  }
}

// GET /runs/:id/results
async function getRunResults(req, res) {
  try {
    const { id } = req.params;

    const scores = await Score.findAll({
      where: { run_id: id },
      include: [
        {
          model: User,
          as: "judge",
          attributes: ["id", "name"],
        },
        {
          model: ScoreDetail,
          as: "scoreDetails",
          include: [
            {
              model: Criterion,
              as: "criterion",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!scores.length) {
      return res.status(404).json({
        message: "No scores found for this run",
      });
    }

    const judgeResults = scores.map((score) => {
      const total = score.scoreDetails.reduce((sum, detail) => sum + Number(detail.value), 0);

      return {
        judge: score.judge.name,
        details: score.scoreDetails.map((d) => ({
          criterion: d.criterion.name,
          value: d.value,
        })),
        total,
      };
    });

    const finalScore = judgeResults.reduce((sum, r) => sum + r.total, 0);

    return res.json({
      run_id: id,
      judges: judgeResults,
      final_score: finalScore,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching run results",
    });
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
  getCompetitorRuns,
  getCategoryRuns,
  getScoreSheet,
  getRunResults,
};
