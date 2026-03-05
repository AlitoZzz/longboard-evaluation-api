const { Model, DataTypes } = require("sequelize");

class Competition extends Model {
  static initModel(sequelize) {
    Competition.init(
      {
        id: {
          type: DataTypes.BIGINT.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
        date: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        location: {
          type: DataTypes.STRING(150),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "Competition",
        tableName: "competitions",
      },
    );

    return Competition;
  }
}

module.exports = Competition;
