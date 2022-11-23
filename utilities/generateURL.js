function generateURL(name) {
    //Removes all external white space
    const trimed = name.trim()
    //Replaces all spaces with hyphens, and converts the entire string to lower case
    const noWhiteSpace = (trimed.toLowerCase()).replace(/\s/g, "-")
    //Replaces all common symbols with nothing
    const finalURLName = noWhiteSpace.replace(/([\/\,\!\\\^\$\@\'\{\}\[\]\(\)\.\*\+\=\?\|\<\>\&])/g, "")
    return finalURLName
}

module.exports = generateURL
