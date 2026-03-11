const express = require("express");
const router = express.Router();
const scoreController = require("../controllers/scoreController");
const { expressjwt: checkJwt } = require("express-jwt");

router.get(
  "/",
  checkJwt({ secret: process.env.JWT_SECRET, algorithms: [process.env.ALGORITHM] }),
  scoreController.index,
);
router.post(
  "/",
  checkJwt({ secret: process.env.JWT_SECRET, algorithms: [process.env.ALGORITHM] }),
  scoreController.store,
);
router.get(
  "/:id",
  checkJwt({ secret: process.env.JWT_SECRET, algorithms: [process.env.ALGORITHM] }),
  scoreController.show,
);
router.patch(
  "/:id",
  checkJwt({ secret: process.env.JWT_SECRET, algorithms: [process.env.ALGORITHM] }),
  scoreController.update,
);
router.delete(
  "/:id",
  checkJwt({ secret: process.env.JWT_SECRET, algorithms: [process.env.ALGORITHM] }),
  scoreController.destroy,
);

module.exports = router;
