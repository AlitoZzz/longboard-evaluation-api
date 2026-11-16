require("dotenv").config();

const { sequelize } = require("../models");

async function runAllSeeders() {
  try {
    await require("./userSeeder")();

    console.log("[Database] ¡Los datos iniciales fueron insertados correctamente!");
  } catch (error) {
    console.error("[Database] Error al ejecutar los seeders:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

runAllSeeders();
