const bcrypt = require("bcrypt");
const { User } = require("../models");

module.exports = async function userSeeder() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "Faltan variables de entorno para crear el administrador: ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD.",
    );
  }

  const saltRounds = Number(process.env.SALT_ROUNDS);

  if (!Number.isInteger(saltRounds) || saltRounds <= 0) {
    throw new Error("La variable SALT_ROUNDS no tiene un valor válido.");
  }

  const name = ADMIN_NAME.trim();
  const email = ADMIN_EMAIL.trim().toLowerCase();

  if (!name || !email || !ADMIN_PASSWORD) {
    throw new Error("Los datos del administrador no pueden estar vacíos.");
  }

  const existingUser = await User.findOne({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.role === "admin") {
      console.log("[Database] El administrador ya existe. No se creó otro.");
      return;
    }

    throw new Error(`El email ${email} ya está registrado y no pertenece a un administrador.`);
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: "admin",
  });

  console.log("[Database] Usuario administrador creado correctamente.");
};
