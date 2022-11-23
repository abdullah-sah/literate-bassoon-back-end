function generateToken() {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_0123456789';
    let token = "";
    for (let i = 0; i < 30; i++) {
        //Creates a random token, with a length of 30 characters, from the string above stored in characters
        token += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return token
}

// console.log(generateToken())

module.exports = generateToken
