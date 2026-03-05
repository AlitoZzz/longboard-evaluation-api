const { Model, DataTypes } = require("sequelize");

class ScoreDetail extends Model {
  static initModel(sequelize) {
    ScoreDetail.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        score_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
        criterion_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
        value: {
          type: DataTypes.DECIMAL(5, 2),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "ScoreDetail",
        tableName: "score_details",
        indexes: [
          {
            unique: true,
            fields: ["score_id", "criterion_id"],
          },
        ],
      },
    );

    return ScoreDetail;
  }
}

module.exports = ScoreDetail;
