const { Model, DataTypes } = require("sequelize");

class Competitor extends Model {
  static initModel(sequelize) {
    Competitor.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        firstname: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        lastname: {
          type: DataTypes.STRING(100),
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        category_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Competitor",
        tableName: "competitors",
      },
    );

    return Competitor;
  }
}

module.exports = Competitor;
