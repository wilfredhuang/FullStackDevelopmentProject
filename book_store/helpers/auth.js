const alertMessage = require("./messenger"); // Bring in alert messenger
const ensureAuthenticated = (req, res, next) => {
  if (req.user.confirmed == true) {
    return next(); // Calling next() to proceed to the next statement
  } else if (req.user.confirmed === null) {
    return next();
  } else {
    alertMessage(
      res,
      "danger",
      "Access Denied",
      "fas fa-exclamation-circle",
      true
    );
    res.redirect("/");
  }
};
module.exports = ensureAuthenticated;
