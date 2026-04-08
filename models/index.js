const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_CONNECTION,
    logging: false,
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
const JudgeCategory = require("./JudgeCategory");

// Inicializar todos los modelos:
User.initModel(sequelize);
Competition.initModel(sequelize);
Category.initModel(sequelize);
Competitor.initModel(sequelize);
Run.initModel(sequelize);
Criterion.initModel(sequelize);
Score.initModel(sequelize);
ScoreDetail.initModel(sequelize);
JudgeCategory.initModel(sequelize);

/*
 * Luego de definir los modelos, se pueden establecer relaciones entre los
 * mismos (usando métodos como belongsTo, hasMany y belongsToMany)...
 */
Competition.hasMany(Category, {
  foreignKey: "competition_id",
  as: "categories",
  onDelete: "CASCADE",
});
Category.belongsTo(Competition, {
  foreignKey: "competition_id",
  as: "competition",
});

Category.hasMany(Competitor, {
  foreignKey: "category_id",
  as: "competitors",
  onDelete: "CASCADE",
});
Competitor.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

Category.hasMany(Criterion, {
  foreignKey: "category_id",
  as: "criteria",
  onDelete: "CASCADE",
});
Criterion.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

User.belongsToMany(Category, {
  through: JudgeCategory,
  foreignKey: "judge_id",
  otherKey: "category_id",
  as: "categories",
});

Category.belongsToMany(User, {
  through: JudgeCategory,
  foreignKey: "category_id",
  otherKey: "judge_id",
  as: "judges",
});

Competitor.hasMany(Run, {
  foreignKey: "competitor_id",
  as: "runs",
  onDelete: "CASCADE",
});
Run.belongsTo(Competitor, {
  foreignKey: "competitor_id",
  as: "competitor",
});

Run.hasMany(Score, {
  foreignKey: "run_id",
  as: "scores",
  onDelete: "CASCADE",
});
Score.belongsTo(Run, {
  foreignKey: "run_id",
  as: "run",
});

User.hasMany(Score, {
  foreignKey: "judge_id",
  as: "scores",
  onDelete: "CASCADE",
});
Score.belongsTo(User, {
  foreignKey: "judge_id",
  as: "judge",
});

Score.hasMany(ScoreDetail, {
  foreignKey: "score_id",
  as: "scoreDetails",
  onDelete: "CASCADE",
});
ScoreDetail.belongsTo(Score, {
  foreignKey: "score_id",
  as: "score",
});

Criterion.hasMany(ScoreDetail, {
  foreignKey: "criterion_id",
  as: "scoreDetails",
  onDelete: "CASCADE",
});
ScoreDetail.belongsTo(Criterion, {
  foreignKey: "criterion_id",
  as: "criterion",
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
  JudgeCategory,
};
