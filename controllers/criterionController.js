const { Criterion, Category } = require("../models");

// GET /criteria
async function index(req, res) {
  try {
    const criteria = await Criterion.findAll({
      include: {
        model: Category,
        as: "category",
      },
    });

    return res.json(criteria);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching criteria",
    });
  }
}

// GET /criteria/:id
async function show(req, res) {
  try {
    const { id } = req.params;

    const criterion = await Criterion.findByPk(id, {
      include: {
        model: Category,
        as: "category",
      },
    });

    if (!criterion) {
      return res.status(404).json({
        message: "Criterion not found",
      });
    }

    return res.json(criterion);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching criterion",
    });
  }
}

// POST /criteria
async function store(req, res) {
  try {
    const { name, max_score, category_id } = req.body;

    const category = await Category.findByPk(category_id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    if (category.status === "active") {
      return res.status(400).json({
        message: "Cannot create a criterion in an active category",
      });
    }

    if (category.status === "completed") {
      return res.status(400).json({
        message: "Cannot create a criterion in a completed category",
      });
    }

    let maxScore;

    !max_score ? (maxScore = category.default_criterion_max_score) : (maxScore = max_score);

    const criterion = await Criterion.create({
      name,
      max_score: maxScore,
      category_id,
    });

    return res.status(201).json(criterion);
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Invalid criterion data",
      });
    }

    return res.status(500).json({
      message: "Error creating criterion",
    });
  }
}

// PATCH /criteria/:id
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, max_score } = req.body;

    const criterion = await Criterion.findByPk(id, {
      include: {
        model: Category,
        as: "category",
      },
    });

    if (!criterion) {
      return res.status(404).json({
        message: "Criterion not found",
      });
    }

    if (criterion.category.status === "active") {
      return res.status(400).json({
        message: "Cannot update a criterion in an active category",
      });
    }

    if (criterion.category.status === "completed") {
      return res.status(400).json({
        message: "Cannot update a criterion in a completed category",
      });
    }

    await criterion.update({
      name,
      max_score,
    });

    return res.json(criterion);
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Invalid criterion data",
      });
    }

    return res.status(500).json({
      message: "Error updating criterion",
    });
  }
}

// DELETE /criteria/:id
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const criterion = await Criterion.findByPk(id, {
      include: {
        model: Category,
        as: "category",
      },
    });

    if (!criterion) {
      return res.status(404).json({
        message: "Criterion not found",
      });
    }

    if (criterion.category.status === "active") {
      return res.status(400).json({
        message: "Cannot delete a criterion from an active category",
      });
    }

    if (criterion.category.status === "completed") {
      return res.status(400).json({
        message: "Cannot delete a criterion from a completed category",
      });
    }

    await criterion.destroy();

    return res.status(200).json({
      message: "Criterion deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error deleting criterion",
    });
  }
}

async function getCategoryCriteria(req, res) {
  try {
    const { id } = req.params;

    const criteria = await Criterion.findAll({
      where: { category_id: id },
    });

    return res.json(criteria);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching category criteria",
    });
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
  getCategoryCriteria,
};
