const requests = {};

const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const currentTime = Date.now();

  if (!requests[ip]) {
    requests[ip] = [];
  }

  requests[ip] = requests[ip].filter(
    (time) => currentTime - time < 60000
  );

  if (requests[ip].length >= 100) {
    return res.status(429).json({
      message: "Too many requests, try again later",
    });
  }

  requests[ip].push(currentTime);
  next();
};

export default rateLimiter;