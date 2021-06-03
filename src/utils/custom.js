const convertDotToSlug = (str, from, to) => {
  return str.split(from).join(to)
}

module.exports = {
  convertDotToSlug
}
