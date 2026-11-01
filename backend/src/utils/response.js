const sendSuccess = (res, statusCode = 200, data = {}, message = null) => {
  const payload = { success: true, ...data };
  if (message) payload.message = message;
  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess
};

