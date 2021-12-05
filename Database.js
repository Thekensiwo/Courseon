const mongoose = require('mongoose');

/* --- Database --- */

const DB_URL = "mongodb://localhost:27017/coursedb";
mongoose.connect(DB_URL).then(res => console.log("connected"))

const userSchema = new mongoose.Schema({
    firstname: {type: 'string', required: true},
    lastname: {type: 'string', required: true},
    email: {type: 'string', required: true},
    password: {type: 'string', required: true},
    courses: Array,
    img: String
})

const courseSchema = new mongoose.Schema({
    title: String,
    price: Number,
    category: String,
    rating: String,
    aboutCourse: String,
    start: String,
    end: String,
    estMeetingsTime: Number,
    rating: Number,
    materials: Array,
    img: String,
    
    authorInfo: Object,
    adminId: String,
    users: Array,
    activeUsers: Array,
    meetings: Array,
    chatMessages: Array
}, {timestamps: {createdAt: "created_at"}})

const categorySchema = new mongoose.Schema({
    title: String,
    img: String
})

const Course = mongoose.model('course',courseSchema)
const User = mongoose.model("user", userSchema)
const Category = mongoose.model("categories", categorySchema)

User.find({}).then(res => console.log(res))

module.exports = {
    Course,
    User,
    Category
}