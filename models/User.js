const { Model, DataTypes } = require("sequelize");

class User extends Model {
  static initModel(sequelize) {
    User.init(
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
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
          set(value) {
            this.setDataValue("email", value.toLowerCase());
          },
        },
        password: {
          type: DataTypes.STRING, // hash
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM("admin", "judge"),
          allowNull: false,
          defaultValue: "judge",
        },
      },
      {
        sequelize,
        modelName: "User",
        tableName: "users",
      },
    );
    return User;
  }
}

module.exports = User;
