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
        title: {
          type: DataTypes.STRING,
        },
        content: {
          type: DataTypes.TEXT,
        },
      },
      {
        sequelize,
        modelName: "Competition", // Nombre del modelo en singular y en minúscula.
      },
    );

    return Competition;
  }
}

module.exports = Competition;
