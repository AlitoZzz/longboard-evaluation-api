const bcrypt = require("bcrypt");
const { User, Category, sequelize } = require("../models");

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

    // validate categories
    if (categoryIds && categoryIds.length > 0) {
      const categories = await Category.findAll({
        where: { id: categoryIds },
        transaction,
      });

      if (categories.length !== categoryIds.length) {
        await transaction.rollback();
        return res.status(400).json({
          message: "One or more categories are invalid",
        });
      }

      // assign categories
      await user.setCategories(categoryIds, { transaction });
    }

    await transaction.commit();

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
      },
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error: error.message });
  }
}

// GET /users
async function index(req, res) {
  try {
    const users = await User.findAll();

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

// PATCH /users/:id/categories
async function setJudgeCategories(req, res) {
  const { id } = req.params;
  const { categoryIds } = req.body;

  try {
    const judge = await User.findByPk(id);

    if (!judge) {
      return res.status(404).json({
        message: "Judge not found",
      });
    }

    if (judge.role !== "judge") {
      return res.status(400).json({
        message: "User is not a judge",
      });
    }

    // Validate categories
    const categories = await Category.findAll({
      where: {
        id: categoryIds,
      },
    });

    if (categories.length !== categoryIds.length) {
      return res.status(400).json({
        message: "One or more categories are invalid",
      });
    }

    // synchronize relations
    await judge.setCategories(categoryIds);

    return res.status(200).json({
      message: "Categories assigned successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Error assigning categories",
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
};
