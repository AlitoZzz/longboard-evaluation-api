const { Competition } = require("../models");

// GET /competitions
async function index(req, res) {
  try {
    const competitions = await Competition.findAll();

    return res.json(competitions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching competitions" });
  }
}

// GET /competitions/:id
async function show(req, res) {
  try {
    const { id } = req.params;

    const competition = await Competition.findByPk(id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    return res.json(competition);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching competition" });
  }
}

// POST /competitions
async function store(req, res) {
  try {
    const { name, date, location } = req.body;

    const competition = await Competition.create({
      name,
      date,
      location,
    });

    return res.status(201).json(competition);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating competition" });
  }
}

// PATCH /competitions/:id
async function update(req, res) {
  try {
    const { id } = req.params;
    const { name, date, location } = req.body;

    const competition = await Competition.findByPk(id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    await competition.update({
      name,
      date,
      location,
    });

    return res.json(competition);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error updating competition" });
  }
}

// DELETE /competitions/:id
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const competition = await Competition.findByPk(id);

    if (!competition) {
      return res.status(404).json({ message: "Competition not found" });
    }

    await competition.destroy();

    return res.status(200).json({ message: "Competition successfully deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error deleting competition" });
  }
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
};
