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
async function store(req, res) {}

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

    const judge_id = req.auth.id;

    const existingScore = await Score.findOne({
      where: {
        run_id: run.id,
        judge_id,
      },
      include: {
        model: ScoreDetail,
        as: "scoreDetails",
      },
    });

    return res.json({
      run_id: run.id,
      competitor: {
        id: run.competitor.id,
        firstname: run.competitor.firstname,
        lastname: run.competitor.lastname,
      },
      category: {
        id: category.id,
        name: category.name,
      },
      criteria: category.criteria.map((c) => ({
        id: c.id,
        name: c.name,
        max_score: c.max_score,
      })),
      already_scored: !!existingScore,

      existing_score: existingScore
        ? {
            id: existingScore.id,
            details: existingScore.scoreDetails.map((d) => ({
              criterion_id: d.criterion_id,
              value: d.value,
            })),
          }
        : null,
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

//PATCH runs/:id/start
async function startRun(req, res) {
  const { id } = req.params;

  const activeRun = await Run.findOne({
    where: { status: "active" },
  });

  if (activeRun) {
    return res.status(400).json({
      message: "There is already an active run",
    });
  }

  const run = await Run.findByPk(id);

  if (!run) {
    return res.status(404).json({
      message: "Run not found",
    });
  }

  await run.update({
    status: "active",
  });

  return res.json(run);
}

// PATCH runs/complete
async function completeRun(req, res) {
  const run = await Run.findOne({
    where: { status: "active" },
  });

  if (!run) {
    return res.status(400).json({
      message: "There is no active run",
    });
  }

  await run.update({
    status: "completed",
  });

  return res.json(run);
}

// GET /runs/active
async function getActiveRun(req, res) {
  try {
    const run = await Run.findOne({
      where: {
        status: "active",
      },
      include: [
        {
          model: Competitor,
          as: "competitor",
          attributes: ["id", "firstname", "lastname"],
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!run) {
      return res.status(200).json({
        active_run: null,
      });
    }

    return res.status(200).json({
      id: run.id,
      number: run.number,
      status: run.status,

      competitor: {
        id: run.competitor.id,
        firstname: run.competitor.firstname,
        lastname: run.competitor.lastname,
      },

      category: {
        id: run.competitor.category.id,
        name: run.competitor.category.name,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error retrieving active run",
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
  startRun,
  completeRun,
  getActiveRun,
};
