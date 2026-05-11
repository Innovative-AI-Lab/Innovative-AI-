export const successResponse = (res, data = {}, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, message = 'Domain error', status = 400, error = null) => {
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message || error;
    response.stack = error.stack;
  }

  return res.status(status).json(response);
};

