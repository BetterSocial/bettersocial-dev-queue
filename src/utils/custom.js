const { parse, tldExists } = require('tldjs');

const convertString = (str, from, to) => {
    return str.split(from).join(to);
};

const checkIfValidURL = (str) => {
    try {
        // const urlRegex = /^(https?:\/\/[a-zA-Z0-9_+%-]+(\.[a-zA-Z0-9+\_%-]+)*(:[0-9]{1,5})?(\/[a-zA-Z0-9+()?#~=&\._%-]*)*)?$/
        const urlRegex = /(https?:\/\/[^ %\n]*)/;
        const urlValidation = str.match(urlRegex);
        console.log(`urlvalidation ${urlValidation}`)
        if (urlValidation) return str.match(urlRegex)[1];

        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        const isDomainOnly = pattern.test(str);
        console.log(`isDomainOnly ${isDomainOnly}`)
        if (isDomainOnly) {
            const newStr = `https://${str}`;
            return newStr.match(urlRegex)[1];
        }

        var urlDashPattern = /[-a-zA-Z0-9-@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/
        const isUrl = urlDashPattern.test(str)
        if (isUrl) return str.match(urlDashPattern)[0]

        return false;
        // const urlRegex = /(https?:\/\/[^ ]*)/;
        // const urlValidation = str.match(urlRegex);

        // if (urlValidation) {
        //   return str.match(urlRegex)[1]
        // } else {
        //   return false
        // }
    } catch (error) {
        console.error('error validation url', error);
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

const generateRandomId = (a = '') =>
    a
        ? /* eslint-disable no-bitwise */
        ((Number(a) ^ (Math.random() * 16)) >> (Number(a) / 4)).toString(16)
        : `${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`.replace(/[018]/g, generateRandomId);

const isStringBlankOrNull = (str) => {
    if (str) {
        if (str !== "") {
            return false;
        }
    }
    return true;
}

const countWordsWithoutLink = (str) => {
    //console.debug("The sentence: " + str);

    const filteredStr = str.replace(/(https?:\/\/[^ ]*)/, "");
    //console.log("filtered:" + filteredStr);

    let matches = filteredStr.match(/([\w\d]+)/g);

    if (matches) {
        return matches.length;
    }

    return 0;
}

const countCharactersWithoutLink = (str) => {
    //console.debug("The sentence: " + str);

    const filteredStr = str.replace(/(https?:\/\/[^ ]*)/g, "");
    //console.debug("filtered:" + filteredStr);

    //let chars = filteredStr.replace(/[^\a-zA-Z]/g,"");
    return filteredStr.length;
}
const isSubDomain = (domain) => {// just for the example

    const { parse, tldExists, getDomain, getSubdomain, getPublicSuffix } = require('tldjs');
    if (getSubdomain(domain)) {
        return true;
    } else {
        return false;
    }
}
const removeSubDomain = (domain) => {
    if (isSubDomain(domain)) {
        return domain.replace(/^[^.]+\./g, "");
    } else {
        return domain;
    }
}


module.exports = {
    convertString,
    dateCreted,
    getToken,
    checkIfValidURL,
    capitalizing,
    generateRandomId,
    isStringBlankOrNull,
    countWordsWithoutLink,
    countCharactersWithoutLink,
    removeSubDomain,
};
