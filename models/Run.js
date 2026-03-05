const { Model, DataTypes } = require("sequelize");

class Run extends Model {
  static initModel(sequelize) {
    Run.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        number: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: false,
          validate: {
            min: 1,
          },
        },
        competitor_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Run",
        tableName: "runs",
        indexes: [
          {
            unique: true,
            fields: ["competitor_id", "number"],
          },
        ],
      },
    );

    return Run;
  }
}

module.exports = Run;
