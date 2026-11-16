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

        admin_id: {
          type: DataTypes.BIGINT.UNSIGNED,
          allowNull: false,
        },

        status: {
          type: DataTypes.ENUM("draft", "active", "completed"),
          allowNull: false,
          defaultValue: "draft",
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
