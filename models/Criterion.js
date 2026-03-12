const { Model, DataTypes } = require("sequelize");

class Criterion extends Model {
  static initModel(sequelize) {
    Criterion.init(
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
        max_score: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: true,
          validate: {
            min: 1,
          },
        },
        category_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Criterion",
        tableName: "criteria",
      },
    );

    return Criterion;
  }
}

module.exports = Criterion;
