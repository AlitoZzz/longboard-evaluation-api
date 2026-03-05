const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE, // Ej: hack_academy_db
  process.env.DB_USERNAME, // Ej: root
  process.env.DB_PASSWORD, // Ej: root
  {
    host: process.env.DB_HOST, // Ej: 127.0.0.1
    dialect: process.env.DB_CONNECTION, // Ej: mysql
    logging: false, // Para que no aparezcan mensajes en consola.
  },
);

// Requerir todos los modelos:
const User = require("./User");
const Competition = require("./Competition");
const Category = require("./Category");
const Competitor = require("./Competitor");
const Run = require("./Run");
const Criterion = require("./Criterion");
const Score = require("./Score");
const ScoreDetail = require("./ScoreDetail");

// Inicializar todos los modelos:
User.initModel(sequelize);
Competition.initModel(sequelize);
Category.initModel(sequelize);
Competitor.initModel(sequelize);
Run.initModel(sequelize);
Criterion.initModel(sequelize);
Score.initModel(sequelize);
ScoreDetail.initModel(sequelize);

/*
 * Luego de definir los modelos, se pueden establecer relaciones entre los
 * mismos (usando métodos como belongsTo, hasMany y belongsToMany)...
 */
Competition.hasMany(Category, {
  foreignKey: "competition_id",
  onDelete: "CASCADE",
});

Category.belongsTo(Competition, {
  foreignKey: "competition_id",
});
Category.hasMany(Competitor, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
});

Competitor.belongsTo(Category, {
  foreignKey: "category_id",
});
Category.hasMany(Criterion, {
  foreignKey: "category_id",
  onDelete: "CASCADE",
});

Criterion.belongsTo(Category, {
  foreignKey: "category_id",
});
Competitor.hasMany(Run, {
  foreignKey: "competitor_id",
  onDelete: "CASCADE",
});

Run.belongsTo(Competitor, {
  foreignKey: "competitor_id",
});
Run.hasMany(Score, {
  foreignKey: "run_id",
  onDelete: "CASCADE",
});

Score.belongsTo(Run, {
  foreignKey: "run_id",
});
User.hasMany(Score, {
  foreignKey: "judge_id",
  onDelete: "CASCADE",
});

Score.belongsTo(User, {
  foreignKey: "judge_id",
});
Score.hasMany(ScoreDetail, {
  foreignKey: "score_id",
  onDelete: "CASCADE",
});

ScoreDetail.belongsTo(Score, {
  foreignKey: "score_id",
});
Criterion.hasMany(ScoreDetail, {
  foreignKey: "criterion_id",
  onDelete: "CASCADE",
});

ScoreDetail.belongsTo(Criterion, {
  foreignKey: "criterion_id",
});

module.exports = {
  sequelize,
  User,
  Competition,
  Category,
  Competitor,
  Run,
  Criterion,
  Score,
  ScoreDetail,
};
