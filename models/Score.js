const { Model, DataTypes } = require("sequelize");

class Score extends Model {
  static initModel(sequelize) {
    Score.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },

        run_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },

        judge_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Score",
        tableName: "scores",
        indexes: [
          {
            unique: true,
            fields: ["run_id", "judge_id"],
          },
        ],
      },
    );

    return Score;
  }
}

module.exports = Score;
