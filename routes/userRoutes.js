const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const adminRequired = require("../middlewares/requireAdmin");

router.get("/", userController.index);
router.post("/", adminRequired, userController.store);
router.get("/:id", userController.show);
router.patch("/:id", userController.update); //solo su propia info si no es admin YA HECHO
router.delete("/:id", adminRequired, userController.destroy);

module.exports = router;
