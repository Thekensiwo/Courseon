const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {User, Course, Category} = require('./Database.js')
const {upload, courseUpload, userUpload} = require('./Storage.js')
const router = express.Router();
const pkey = "LI252%3wxy7(9*aaaA321"


router.get('/', (req, res) => {
    res.render('main', {user: req.user})
})


router.get('/categories', async (req, res) => {

    const cats = await Category.find({})
    
    res.render('categories', {cats, user: req.user})
})


router.get('/category', async (req, res) => {

    const cat = req.query.id;

    const category = await Category.findOne({_id: cat})
    const courses = await Course.find({category: category.title})
    
    res.render('category', {courses, category, user: req.user})
})


router.get('/newest', async (req, res) => {

    const courses = await Course.find({sort: {createdAt: -1}}).limit(10)
    res.render('newest', {courses, user: req.user})
})


router.get('/login', (req, res) => {
    res.render('login', {user: req.user})
})


router.get('/register', (req, res) => {
    res.render('register', {user: req.user})
})


router.get('/course', async (req, res) => {

    const id = req.query.id;
    const course = await Course.findOne({_id: id})
    let permission = "user";

    if(req.query.meeting == null)
        req.query.meeting = 0

    // Check if user has the permission to access this course
    if(req.user == null){
        res.render('course', {noAccess: true})
        return
    }

    if(course.adminId == req.user.userId){
        permission =  "admin"
        res.render('course', {roomId: id, meetingId: req.query.meeting, course, user: req.user, permission, noAccess: false})
        return
    }

    if(!course.users.includes(req.user.userId)){
        res.render('course', {noAccess: true})
        return
    }

    res.render('course', {roomId: id, meetingId: req.query.meeting, course, user: req.user, permission, noAccess: false})
})



router.get('/creator', async (req, res) => {
    
    const cats = await Category.find({})
    res.render('creator', {user: req.user, categories: cats})
})



router.get('/courseInfo', async (req, res) => {

    const id = req.query.id;

    const course = await Course.findOne({_id: id})

    res.render('courseInfo', {course: course, user: req.user})
})



router.get('/getMaterial', async (req,res) =>{

    const id = req.query.id;

    res.sendFile(`${__dirname}/uploads/${id}`)
})



router.post('/addcourse', courseUpload.fields([{name: "courseImg", maxCount: 1},{name: "materials[]", maxCount: 10}]), async (req,res) =>{

    const {title,price,authorInfo,aboutCourse,start,end,estMeetingsTime,category,meetings} = JSON.parse(req.body.jsondata);

    const urls = req.files['materials[]'].map(file =>{
        return file.filename;
    })
    
    const course = new Course({
        title: title,
        price,
        authorInfo: req.user,
        aboutCourse,
        start,
        end,
        estMeetingsTime,
        category,
        meetings,
        rating: 5,
        users: [],
        chatMessages: [],
        materials: urls,
        adminId: req.user.userId,
        img: req.files['courseImg'][0].filename
    })

    course.save().then(async (resp) => {
        const saved = await User.updateOne({_id: req.user.userId}, {$push: {courses: resp}})
        console.log(" \n\n\n === SAVED === \n\n\n", saved)
        res.redirect('newest')
    })
})



router.post('/addMaterial', upload.single('addmaterial'), async (req, res) => {

    const id = req.query.id;
    const course = await Course.updateOne({_id: id}, {$push: {materials: req.file.filename}})

    res.end()
})



router.get('/courseMaterial', async (req, res) => {

    // Sprawdz czy user ma dostep do kursu
    const user = req.user;
    const course = await Course.findOne({_id: req.query.course})
``
    if(user != null && course.users.includes(user.userId))
        res.sendFile(__dirname + `/uploads/${req.query.id}`)
    else
        res.redirect(`/course?id=${req.query.course}`)
})



router.get('/purchase-course', async (req, res) => {

    const id = req.query.id;

    const c = await Course.findOne({_id: id})
    const user = await User.findOne({_id: req.user.userId})
    let x = false;

    user.courses.forEach(cs =>{
        if(cs._id.toString() == c._id.toString())
            x = true
    })
    
    if(x == false){
        const course = await Course.updateOne({_id: id}, {$push: {users: req.user.userId}})
        const add = await User.updateOne({_id: req.user.userId}, {$push: {courses: c}})
    }
    else{
        console.log('=== not updated ===')
    }

    res.redirect('/')
})





/* --- Login --- */


router.post('/login', async (req, res) => {

    const {email,password}= req.body;

    console.log(email,password)

    try{
        const findUser = await User.findOne({email: email}) || null
        console.log("user1", findUser)
        if(findUser != null && await bcrypt.compare(password,findUser.password)){

            console.log("user:", findUser)
            const token = jwt.sign({id: findUser._id},pkey)
            res.cookie("Auth-token",token).redirect('/')
        }
        else
            res.redirect('/login')
    }
    catch(err){
        console.log("ERROR!!!!!!!!!!!:", err)
        res.redirect('/login')
    }
})



router.post('/register', userUpload.single('userImg'), async (req, res) => {

    const {first,last,email,password} = req.body;
    try{

        const findUsers = await User.find({email: email});

        if(findUsers.length > 0){
            res.redirect('/register', {msg: "User with passed credentials already exists"})
        }
        else{
            
            const newUser = new User({
                firstname: first,
                lastname: last,
                email: email,
                password: await bcrypt.hash(password,10),
                courses: [],
                img: req.file.filename
            })

            newUser.save().then(resp => {

                const token = jwt.sign({id: resp._id},pkey)
                res.cookie("Auth-token",token).redirect('/')
            })
        }
    }
    catch(err){
        console.log("--- error ---", err)
    }
})



router.get('/logout', (req,res) =>{
    res.clearCookie("Auth-token").redirect('/');
})




module.exports = router