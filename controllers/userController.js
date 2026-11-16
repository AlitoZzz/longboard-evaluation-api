const bcrypt = require("bcrypt");
const { User, Category, sequelize, Competition, JudgeCategory } = require("../models");

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

// POST /users

async function store(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { name, email, password, categoryIds } = req.body;

    const existingUser = await User.findOne({
      where: { email },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();

      return res.status(409).json({
        message: "Email already in use",
      });
    }

    let requestedIds = [];

    if (categoryIds !== undefined) {
      if (!Array.isArray(categoryIds)) {
        await transaction.rollback();

        return res.status(400).json({
          message: "categoryIds must be an array",
        });
      }

      requestedIds = categoryIds.map(Number);

      // Evitar IDs duplicados
      if (requestedIds.some((categoryId, index) => requestedIds.indexOf(categoryId) !== index)) {
        await transaction.rollback();

        return res.status(400).json({
          message: "categoryIds cannot contain duplicates",
        });
      }

      // Buscar las categorías y sus competencias
      const categories = await Category.findAll({
        where: { id: requestedIds },
        include: {
          model: Competition,
          as: "competition",
          attributes: ["id", "admin_id"],
        },
        transaction,
      });

      if (categories.length !== requestedIds.length) {
        await transaction.rollback();

        return res.status(400).json({
          message: "One or more categories are invalid",
        });
      }

      // Validar autoría y estado
      for (const category of categories) {
        if (Number(category.competition.admin_id) !== Number(req.auth.id)) {
          await transaction.rollback();

          return res.status(403).json({
            message: "You do not have permission to assign judges to this category",
          });
        }

        if (category.status !== "draft") {
          await transaction.rollback();

          return res.status(400).json({
            message: "Cannot assign judges to active or completed categories",
          });
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create(
      {
        name,
        email,
        password: hashedPassword,
        role: "judge",
      },
      { transaction },
    );

    if (requestedIds.length > 0) {
      await user.setCategories(requestedIds, { transaction });
    }

    await transaction.commit();

    return res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
      },
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}

// GET /users?role=judge
async function index(req, res) {
  try {
    const { role } = req.query;

    if (role && !["admin", "judge"].includes(role)) {
      return res.status(400).json({
        message: "Invalid user role",
      });
    }

    const where = role ? { role } : {};

    const users = await User.findAll({
      where,
      attributes: ["id", "name", "email", "role"],
      order: [["name", "ASC"]],
    });

    return res.json(users);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error al obtener los usuarios",
    });
  }
}

// GET /users/:id
async function show(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PATCH /users/:id
async function update(req, res) {
  try {
    const id = Number(req.params.id);
    const { name, email, password } = req.body;
    const userId = req.auth.id;
    const role = req.auth.role;

    if (role !== "admin" && userId !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin" && userId !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (password) {
      user.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        id: user.id,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// DELETE /users/:id
async function destroy(req, res) {
  try {
    const id = Number(req.params.id);
    const userId = req.auth.id;
    const role = req.auth.role;

    if (role !== "admin" && userId !== id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// PATCH /competitions/:competitionId/judges/:judgeId/categories

async function setJudgeCategories(req, res) {
  const { competitionId, judgeId } = req.params;
  const { categoryIds } = req.body;
  const transaction = await sequelize.transaction();

  try {
    const competition = await Competition.findByPk(competitionId, {
      transaction,
    });

    if (!competition) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Competition not found",
      });
    }

    if (Number(competition.admin_id) !== Number(req.auth.id)) {
      await transaction.rollback();
      return res.status(403).json({
        message: "You do not have access to this competition",
      });
    }

    const judge = await User.findByPk(judgeId, { transaction });

    if (!judge) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Judge not found",
      });
    }

    if (judge.role !== "judge") {
      await transaction.rollback();
      return res.status(400).json({
        message: "User is not a judge",
      });
    }

    if (!Array.isArray(categoryIds)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "categoryIds must be an array",
      });
    }

    const requestedIds = categoryIds.map(Number);

    if (requestedIds.some((categoryId, index) => requestedIds.indexOf(categoryId) !== index)) {
      await transaction.rollback();
      return res.status(400).json({
        message: "categoryIds cannot contain duplicates",
      });
    }

    // Obtener las categorías actuales del juez dentro de esta competencia
    const currentCategories = await judge.getCategories({
      where: { competition_id: competitionId },
      attributes: ["id", "status"],
      transaction,
    });

    const currentIds = currentCategories.map((category) => Number(category.id));

    // Validar que todas las categorías solicitadas pertenezcan
    // a la competencia indicada
    const categories = await Category.findAll({
      where: {
        id: requestedIds,
        competition_id: competitionId,
      },
      transaction,
    });

    if (categories.length !== requestedIds.length) {
      await transaction.rollback();
      return res.status(400).json({
        message: "One or more categories are invalid for this competition",
      });
    }

    // No permitir agregar asignaciones nuevas a categorías bloqueadas
    const categoriesToAdd = categories.filter(
      (category) => !currentIds.includes(Number(category.id)),
    );

    if (categoriesToAdd.some((category) => category.status !== "draft")) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Cannot assign judges to active or completed categories",
      });
    }

    // No permitir quitar asignaciones de categorías bloqueadas
    const requestedIdSet = new Set(requestedIds);

    const categoriesToRemove = currentCategories.filter(
      (category) => !requestedIdSet.has(Number(category.id)),
    );

    if (categoriesToRemove.some((category) => ["active", "completed"].includes(category.status))) {
      await transaction.rollback();
      return res.status(400).json({
        message: "Cannot change judge assignments for active or completed categories",
      });
    }

    // Eliminar únicamente las relaciones de esta competencia
    if (categoriesToRemove.length > 0) {
      await JudgeCategory.destroy({
        where: {
          judge_id: judgeId,
          category_id: categoriesToRemove.map((category) => Number(category.id)),
        },
        transaction,
      });
    }

    // Agregar únicamente las relaciones nuevas de esta competencia
    if (categoriesToAdd.length > 0) {
      await JudgeCategory.bulkCreate(
        categoriesToAdd.map((category) => ({
          judge_id: judgeId,
          category_id: Number(category.id),
        })),
        { transaction },
      );
    }

    await transaction.commit();

    return res.status(200).json({
      message: "Categories assigned successfully",
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error(error);

    return res.status(500).json({
      message: "Error assigning categories",
    });
  }
}

// GET /competitions/:id/judges
async function getCompetitionJudges(req, res) {
  try {
    const { id } = req.params;

    const judges = await User.findAll({
      where: {
        role: "judge",
      },
      attributes: ["id", "name", "email", "role"],
      include: [
        {
          model: Category,
          as: "categories",
          attributes: ["id", "name"],
          through: {
            attributes: [],
          },
          where: {
            competition_id: id,
          },
          required: true,
        },
      ],
      order: [["name", "ASC"]],
    });

    return res.json(judges);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error fetching competition judges",
    });
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
  setJudgeCategories,
  getCompetitionJudges,
};
