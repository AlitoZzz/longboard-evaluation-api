const { Run, Competitor, Category, Score, ScoreDetail, User, Criterion } = require("../models");
const calculateRunResult = require("../utils/claculateRunResults");

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

    const category = await Category.findByPk(id, {
      include: {
        model: User,
        as: "judges",
        attributes: ["id"],
        through: {
          attributes: [],
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

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

    const runIds = runs.map((run) => run.id);

    const scores = runIds.length
      ? await Score.findAll({
          where: {
            run_id: runIds,
          },
          attributes: ["run_id"],
          raw: true,
        })
      : [];

    const scoresByRun = {};

    scores.forEach((score) => {
      scoresByRun[score.run_id] = (scoresByRun[score.run_id] || 0) + 1;
    });

    const assignedJudgesCount = category.judges.length;

    const runsWithScoreProgress = runs.map((run) => ({
      ...run.toJSON(),
      assigned_judges_count: assignedJudgesCount,
      scored_judges_count: scoresByRun[run.id] || 0,
    }));

    return res.json(runsWithScoreProgress);
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

    const { finalScore } = calculateRunResult(scores);

    return res.json({
      run_id: id,
      judges: judgeResults,
      final_score: Number(finalScore.toFixed(2)),
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
  try {
    const { id } = req.params;

    const run = await Run.findByPk(id, {
      include: {
        model: Competitor,
        as: "competitor",
        include: {
          model: Category,
          as: "category",
          attributes: ["id", "competition_id"],
        },
      },
    });

    if (!run) {
      return res.status(404).json({
        message: "Run not found",
      });
    }

    if (run.status === "active") {
      return res.status(400).json({
        message: "Run is already active",
      });
    }

    if (run.status === "completed") {
      return res.status(400).json({
        message: "Run is already completed",
      });
    }

    const competitionId = run.competitor.category.competition_id;

    const activeRun = await Run.findOne({
      where: {
        status: "active",
      },
      include: {
        model: Competitor,
        as: "competitor",
        required: true,
        include: {
          model: Category,
          as: "category",
          required: true,
          where: {
            competition_id: competitionId,
          },
        },
      },
    });

    if (activeRun) {
      return res.status(400).json({
        message: "There is already an active run in this competition",
      });
    }

    await run.update({
      status: "active",
    });

    return res.json(run);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error starting run",
    });
  }
}

// PATCH runs/:id/complete
async function completeRun(req, res) {
  try {
    const { id } = req.params;

    const run = await Run.findByPk(id);

    if (!run) {
      return res.status(404).json({
        message: "Run not found",
      });
    }

    if (run.status !== "active") {
      return res.status(400).json({
        message: "Run is not active",
      });
    }

    await run.update({
      status: "completed",
    });

    return res.json(run);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error completing run",
    });
  }
}

// GET /runs/active
async function getActiveRun(req, res) {
  const judge_id = req.auth.id;

  try {
    const judge = await User.findByPk(judge_id, {
      include: {
        model: Category,
        as: "categories",
        attributes: ["id"],
        through: { attributes: [] },
      },
    });

    const allowedCategoryIds = judge.categories.map((c) => c.id);

    if (allowedCategoryIds.length === 0) {
      return res.status(200).json({
        active_run: null,
      });
    }

    const run = await Run.findOne({
      where: {
        status: "active",
      },
      include: [
        {
          model: Competitor,
          as: "competitor",
          required: true,
          attributes: ["id", "firstname", "lastname"],
          include: [
            {
              model: Category,
              as: "category",
              required: true,
              attributes: ["id", "name"],
              where: {
                id: allowedCategoryIds,
              },
            },
          ],
        },
      ],
    });

    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    });

    if (!run) {
      return res.status(200).json({
        active_run: null,
      });
    }

    const existingScore = await Score.findOne({
      where: {
        run_id: run.id,
        judge_id: judge_id,
      },
    });

    return res.status(200).json({
      active_run: {
        id: run.id,
        number: run.number,
        status: run.status,

        already_scored: !!existingScore,

        competitor: {
          id: run.competitor.id,
          firstname: run.competitor.firstname,
          lastname: run.competitor.lastname,
        },

        category: {
          id: run.competitor.category.id,
          name: run.competitor.category.name,
        },
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
  getCompetitorRuns,
  getCategoryRuns,
  getScoreSheet,
  getRunResults,
  startRun,
  completeRun,
  getActiveRun,
};
