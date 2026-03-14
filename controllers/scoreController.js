const {
  Criterion,
  Score,
  Run,
  User,
  ScoreDetail,
  Competitor,
  Category,
  sequelize,
} = require("../models");

// GET /scores
async function index(req, res) {
  try {
    const scores = await Score.findAll({
      include: [
        {
          model: Run,
          as: "run",
        },
        {
          model: User,
          as: "judge",
        },
        {
          model: ScoreDetail,
          as: "scoreDetails",
        },
      ],
    });

    return res.json(scores);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching scores",
    });
  }
}

// GET /scores/:id
async function show(req, res) {
  try {
    const { id } = req.params;

    const score = await Score.findByPk(id, {
      include: [
        {
          model: Run,
          as: "run",
        },
        {
          model: User,
          as: "judge",
        },
        {
          model: ScoreDetail,
          as: "scoreDetails",
        },
      ],
    });

    if (!score) {
      return res.status(404).json({
        message: "Score not found",
      });
    }

    return res.json(score);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching score",
    });
  }
}

// POST /scores
async function store(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { run_id, details } = req.body;
    const judge_id = req.auth.id;

    if (!details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({
        message: "Score details are required",
      });
    }

    // verify run exists and get category criteria
    const run = await Run.findByPk(run_id, {
      include: {
        model: Competitor,
        as: "competitor",
        include: {
          model: Category,
          as: "category",
          include: {
            model: Criterion,
            as: "criteria",
          },
        },
      },
    });

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

    // verify judge has not already scored this run
    const existingScore = await Score.findOne({
      where: { run_id, judge_id },
      transaction,
      lock: true,
    });

    if (existingScore) {
      return res.status(400).json({
        message: "Judge has already scored this run",
      });
    }

    const criteriaIds = details.map((d) => d.criterion_id);

    // check duplicated criteria
    const uniqueCriteria = new Set(criteriaIds);

    if (uniqueCriteria.size !== criteriaIds.length) {
      return res.status(400).json({
        message: "Duplicate criteria in score details",
      });
    }

    const validCriteriaIds = run.competitor.category.criteria.map((c) => c.id);

    // verify all criteria belong to the category
    const allValid = criteriaIds.every((id) => validCriteriaIds.includes(id));

    if (!allValid) {
      return res.status(400).json({
        message: "Criteria do not belong to this category",
      });
    }

    // prevent partial evaluations
    if (criteriaIds.length !== validCriteriaIds.length) {
      return res.status(400).json({
        message: "All criteria must be scored",
      });
    }

    // check max_score per criterion
    const criteria = run.competitor.category.criteria;
    for (const detail of details) {
      const criterion = criteria.find((c) => c.id === detail.criterion_id);
      if (!criterion) {
        return res.status(400).json({ message: "Invalid criterion" });
      }
      if (typeof detail.value !== "number") {
        return res.status(400).json({ message: `Score for ${criterion.name} must be a number` });
      }
      if (detail.value < 0) {
        return res.status(400).json({ message: `Score for ${criterion.name} cannot be negative` });
      }
      if (detail.value > criterion.max_score) {
        return res
          .status(400)
          .json({ message: `${criterion.name} max score is ${criterion.max_score}` });
      }
    }

    const score = await Score.create(
      {
        run_id,
        judge_id,
      },
      { transaction },
    );

    const scoreDetailsData = details.map((detail) => ({
      score_id: score.id,
      criterion_id: detail.criterion_id,
      value: detail.value,
    }));

    await ScoreDetail.bulkCreate(scoreDetailsData, { transaction });

    await transaction.commit();

    const createdScore = await Score.findByPk(score.id, {
      include: [
        {
          model: ScoreDetail,
          as: "scoreDetails",
        },
      ],
    });

    return res.status(201).json(createdScore);
  } catch (error) {
    await transaction.rollback();

    console.error(error);
    return res.status(500).json({
      message: "Error creating score",
    });
  }
}

// PATCH /scores/:id
async function update(req, res) {
  try {
    const { id } = req.params;

    const score = await Score.findByPk(id);

    if (!score) {
      return res.status(404).json({
        message: "Score not found",
      });
    }

    await score.update(req.body);

    return res.json(score);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error updating score",
    });
  }
}

// DELETE /scores/:id
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const score = await Score.findByPk(id);

    if (!score) {
      return res.status(404).json({
        message: "Score not found",
      });
    }

    await score.destroy();

    return res.status(200).json({
      message: "Score deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error deleting score",
    });
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
};
