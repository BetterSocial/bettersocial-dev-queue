const notFoundHandler = (req, res) => {
  const msg = `Route : ${req.url} Not found.`
  const err = new Error(msg)
  res.status(404).json({
    code: 404,
    error: err.toString(),
    status: 404,
    msg,
  })
}

const errorHandler = (error, res) => {
  if (!error.statusCode) error.statusCode = 500
  res.status(error.statusCode).json({
    code: error.statusCode || 500,
    error: error.toString(),
    status: error.statusCode,
    msg: error.toString(),
  })
}

const successResponse = (res, msg, data) => res.status(200).json({
  code: 200,
  message: `${msg}`,
  status: 'success',
  data
})

const errorResponse = (res, msg, code) => {
  const message = {
    code,
    message: `Error. ${msg}`,
    status: 'something wrong',
    data: []
  }
  if (msg.errmsg) {
    message.message = msg.errmsg
  } else if (msg.message) {
    message.message = msg.message
  } else if (msg.errors) {
    message.message = msg.errors
  }
  res.status(code).json(message)
}

const customResponse = (res, code, msg, data) => {
  res.status(code).json({
    code,
    message: msg,
    data
  })
}

module.exports = {
  notFoundHandler,
  errorHandler,
  successResponse,
  errorResponse,
  customResponse
}
