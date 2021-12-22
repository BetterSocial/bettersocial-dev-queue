const convertString = (str, from, to) => {
  return str.split(from).join(to);
};

const checkIfValidURL = (str) => {
  try {


    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    const isDomainOnly = !!pattern.test(str);

    const urlRegex = /(https?:\/\/[^ ]*)/;
    const urlValidation = str.match(urlRegex);

    if (urlValidation) {
      return str.match(urlRegex)[1];
    } else if (isDomainOnly) {
      const newStr = `https://${str}`;
      return newStr.match(urlRegex)[1];
    } else {
      return false;
    }
    // const urlRegex = /(https?:\/\/[^ ]*)/;
    // const urlValidation = str.match(urlRegex);

    // if (urlValidation) {
    //   return str.match(urlRegex)[1]
    // } else {
    //   return false
    // }
  } catch (error) {
    console.log('error validation url', error);
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
