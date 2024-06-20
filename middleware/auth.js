const jwt = require("jsonwebtoken");
const jwtSecret = process.env["JWT_SECRET"];

exports.adminAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(403).json({ message: "Not authorized" });
      } else {
        if (decodedToken.role !== "Admin") {
          return res.status(403).json({ message: "Not authorized" });
        } else {
          res.locals.userToken = decodedToken;
          next();
        }
      }
    });
  } else {
    return res.status(403).json({ message: "Not authorized, token not available" });
  }
};
exports.userAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(403).json({ message: "Not authorized" });
      } else {
        res.locals.userToken = decodedToken;
        next();
      }
    });
  } else {
    return res.status(403).json({ message: "Not authorized, token not available" });
  }
};

exports.checkAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      res.locals.userToken = err ? false : decodedToken;
      next();
    });
  } else {
    res.locals.userToken = false;
    next();
  }
};