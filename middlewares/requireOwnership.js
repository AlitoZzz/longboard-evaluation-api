function requireOwnership(getOwner) {
  return async (req, res, next) => {
    try {
      const owner = await getOwner(req);

      if (!owner) {
        return res.status(404).json({
          message: "Resource not found",
        });
      }

      if (Number(owner.admin_id) !== Number(req.auth.id)) {
        return res.status(403).json({
          message: "You do not have permission to access this resource",
        });
      }

      next();
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Error checking resource ownership",
      });
    }
  };
}

module.exports = requireOwnership;

// function requireOwnership(Model, association) {
//   return async (req, res, next) => {
//     try {
//       const { id } = req.params;
//       const ownerId = req.auth.id;

//       const resource = await Model.findByPk(id, {
//         include: {
//           association,
//           attributes: ["id"],
//         },
//       });

//       if (!resource) {
//         return res.status(404).json({
//           message: "Resource not found",
//         });
//       }

//       if (resource[association].id !== ownerId) {
//         return res.status(403).json({
//           message: "You do not have permission to access this resource",
//         });
//       }

//       req.resource = resource;

//       next();
//     } catch (error) {
//       console.error(error);

//       return res.status(500).json({
//         message: "Error checking resource ownership",
//       });
//     }
//   };
// }
