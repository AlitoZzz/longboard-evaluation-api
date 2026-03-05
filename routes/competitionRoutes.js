const express = require("express");
const router = express.Router();
const competitionController = require("../controllers/competitionController");

/*
 * API endpoints relacionados a los artículos.
 *
 * Notar que todos estos endpoints tienen como prefijo el string "/competitions",
 * tal como se definió en el archivo `routes/index.js`.
 */

router.get("/", competitionController.index);
router.post("/", competitionController.store);
router.get("/:id", competitionController.show);
router.patch("/:id", competitionController.update);
router.delete("/:id", competitionController.destroy);

module.exports = router;
