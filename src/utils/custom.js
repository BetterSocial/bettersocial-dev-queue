const convertString = (str, from, to) => {
  return str.split(from).join(to);
};

const checkIfValidURL = (str) => {
  console.log(str);
  const urlRegex = /(https?:\/\/[^ ]*)/;
  const urlValidation = str.match(urlRegex);

  const urlRegexHttp = /(http?:\/\/[^ ]*)/;
  const validationUrlHttp = str.match(urlRegexHttp)

  if (urlValidation) {
    return str.match(urlRegex)[1];
  } else if (validationUrlHttp) {
    return str.match(urlRegexHttp)[1];
  } else {
    return false;
  }
};



const dateCreted = {
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const getToken = (req) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    token = null;
  }

  return token;
};

function capitalizing(str) {
  return (
    str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
      })
      // uppercase the first character
      .replace(/^./, function (str) {
        return str.toUpperCase();
      })
  );
}

module.exports = {
  convertString,
  dateCreted,
  getToken,
  checkIfValidURL,
  capitalizing,
};
