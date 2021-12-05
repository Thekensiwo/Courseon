const path = require('path')
const multer = require('multer');


/* --- Main storage --- */
const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"uploads/")
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})


/* --- User img storage --- */

const userStorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"public/userImgs/")
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const userUpload = multer({storage: userStorage})

/* --- Course img storage --- */



const courseStorage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"public/courseImgs/")
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const courseUpload = multer({storage: courseStorage})



module.exports = {
    courseUpload,
    userUpload,
    upload
}