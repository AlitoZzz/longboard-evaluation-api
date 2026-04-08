const { Model, DataTypes } = require("sequelize");

class JudgeCategory extends Model {
  static initModel(sequelize) {
    JudgeCategory.init(
      {
        judge_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
        category_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
          primaryKey: true,
        },
      },
      {
        sequelize,
        modelName: "JudgeCategory",
        tableName: "judge_categories",
      },
    );

    return JudgeCategory;
  }
}

module.exports = JudgeCategory;
