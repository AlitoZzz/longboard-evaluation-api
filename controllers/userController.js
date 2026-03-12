const bcrypt = require("bcrypt");
const { User } = require("../models");

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

// POST /users
async function store(req, res) {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "judge",
    });

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
      },
    });
  } catch (error) {
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

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
};
