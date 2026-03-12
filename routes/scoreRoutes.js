const express = require("express");
const router = express.Router();
const scoreController = require("../controllers/scoreController");
const adminRequired = require("../middlewares/requireAdmin");

router.get("/", scoreController.index);
router.post("/", scoreController.store);
router.get("/:id", scoreController.show);
router.patch("/:id", adminRequired, scoreController.update);
router.delete("/:id", adminRequired, scoreController.destroy);
module.exports = router;
