const {User} = require('./Database.js')
const jwt = require('jsonwebtoken');
const pkey = "LI252%3wxy7(9*aaaA321"

function getToken(tk){

    let token = tk.find(cookie => {
        return cookie.indexOf('Auth-token=') != -1
    })

    if (token == undefined)
        return
    else
        token = token.trim().slice(11)

    return token
}



async function auth(req,res,next){

    const token = req.cookies['Auth-token'] || null
    req.user = null

    if(token == null){
        next()
        return
    }

    try{
        const verified = jwt.verify(token,pkey)
        const findUser = await User.findOne({_id: verified.id}) || null

        if(findUser != null){
            req.user = {
                userId: findUser._id,
                firstname: findUser.firstname,
                lastname: findUser.lastname,
                email: findUser.email,
                courses: findUser.courses,
                img: findUser.img
            }
        }
    }
    catch(err){
        console.log("error",err)
    }

    next()
}

module.exports = {auth, getToken}