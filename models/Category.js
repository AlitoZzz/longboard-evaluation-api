const { Model, DataTypes } = require("sequelize");

class Category extends Model {
  static initModel(sequelize) {
    Category.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        max_runs: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          validate: {
            min: 1,
          },
        },
        competition_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
        default_criterion_max_score: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          validate: { min: 1 },
        },
      },
      {
        sequelize,
        modelName: "Category",
        tableName: "categories",
      },
    );

    return Category;
  }
}

module.exports = Category;
