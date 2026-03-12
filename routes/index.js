/*
 * No hay una única forma de organizar las rutas de un sitio web.
 * Una alternativa podría ser organizar las rutas por recurso (o entidad):
 */

const userRoutes = require("./userRoutes");
const competitionRoutes = require("./competitionRoutes");
const exampleRoutes = require("./exampleRoutes");
const categoryRoutes = require("./categoryRouotes");
const competitorRoutes = require("./competitorRoutes");
const criterionRoutes = require("./criterionRoutes");
const runRoutes = require("./runRoutes");
const scoreRoutes = require("./scoreRoutes");
const authRoutes = require("./authRoutes");
const { expressjwt: checkJwt } = require("express-jwt");

module.exports = (app) => {
  /*
   * Al construir una API REST, la convención es que las rutas relativas a
   * un recurso (o entidad) tengan como prefijo el nombre de dicho recurso
   * en inglés y en plural.
   *
   * Ejemplo:
   * Las rutas relativas a los usuarios se agrupan bajo la URL `/users`
   * (en inglés y en plural). Del mismo modo, las rutas relativas a los artículos
   * se deberían agrupar bajo la URL `/articles` (en inglés y en plural).
   */
  app.use(
    "/users",
    checkJwt({
      secret: process.env.JWT_SECRET,
      algorithms: [process.env.ALGORITHM],
    }),
    userRoutes,
  );
  app.use(
    "/competitions",
    checkJwt({
      secret: process.env.JWT_SECRET,
      algorithms: [process.env.ALGORITHM],
    }),
    competitionRoutes,
  );
  app.use("/examples", exampleRoutes);
  app.use(
    "/categories",
    checkJwt({
      secret: process.env.JWT_SECRET,
      algorithms: [process.env.ALGORITHM],
    }),
    categoryRoutes,
  );
  app.use(
    "/competitors",
    checkJwt({
      secret: process.env.JWT_SECRET,
      algorithms: [process.env.ALGORITHM],
    }),
    competitorRoutes,
  );
  app.use(
    "/criteria",
    checkJwt({
      secret: process.env.JWT_SECRET,
      algorithms: [process.env.ALGORITHM],
    }),
    criterionRoutes,
  );
  app.use(
    "/runs",
    checkJwt({
      secret: process.env.JWT_SECRET,
      algorithms: [process.env.ALGORITHM],
    }),
    runRoutes,
  );
  app.use(
    "/scores",
    checkJwt({
      secret: process.env.JWT_SECRET,
      algorithms: [process.env.ALGORITHM],
    }),
    scoreRoutes,
  );
  app.use("/auth", authRoutes);
};
