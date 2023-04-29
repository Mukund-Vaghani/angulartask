const express = require('express');
var router = express.Router();
var auth = require('./auth_model');
var middleware = require('../../../middleware/validation');
const { request } = require('express');
var multer = require('multer');
var path = require('path');


router.post('/signup', (req,res)=>{
    var request = req.body;

    var rules = {
        user_name:'required',
        email:'required|email',
        user_password:'required'
    }

    var message = {
        required:'You forgot this :attr field',
        email:':attr is not valid'
    }

    if(middleware.checkVallidationRules(request,res,rules,message)){
        auth.signup(request, function(code,message,data){
            middleware.send_response(req,res,code,message,data);
        })
    }

})

router.post('/login', (req,res)=>{
    var request = req.body;

    var rules = {
        user_name:'required',
        user_password:'required'
    }

    var message = {
        required:'You forgot this :attr field',
    }

    if(middleware.checkVallidationRules(request,res,rules,message)){
        auth.login(request, function(code,message,data){
            middleware.send_response(req,res,code,message,data);
        })
    }
})

router.post('/listing',(req,res)=>{
    auth.listing(request, function(code,message,data){
        middleware.send_response(req,res,code,message,data);
    })
})

router.post('/logout',(req,res)=>{
    var id = req.user_id;
    auth.logoutUser(id,function(code,message,data){
        middleware.send_response(req,res,code,message,data);
    })
})

router.post('/ads',(req,res)=>{
    var request = req.body;
    var id = req.user_id;

    var rules = {
        title:'required',
        description:'required',
        photo_url:'required'
    }

    var message = {
        required:'You forgot this :attr field',
    }

    if(middleware.checkVallidationRules(request,res,rules,message)){
        auth.addAds(request,id, function(code,message,data){
            middleware.send_response(req,res,code,message,data);
        })
    }
})

router.post('/adslisting',(req,res)=>{
    var request = req.body;
    var page = req.query.page;
    var limit = req.query.limit

    auth.adsListing(request,page,limit,function(code,message,data){
        middleware.send_response(req,res,code,message,data);
    })
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../api/public/user')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({
    storage: storage,
    limits: {
        fileSize: (12 * 1024 * 1024)
    }
}).single('profile');


router.post('/uploadprofilepicture', function (req, res) {
    upload(req, res, function (error) {
        if (error) {
            console.log(error);
            middleware.send_response(req, res, "0", "fail to upload restaurant image", null);
        } else {
            middleware.send_response(req, res, "1", "upload success", { image: req.file.filename });
        }
    })
})

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../api/public/ads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

var upload = multer({
    storage: storage,
    limits: {
        fileSize: (12 * 1024 * 1024)
    }
}).single('adspost');


router.post('/uploadadsimage', function (req, res) {
    upload(req, res, function (error) {
        if (error) {
            console.log(error);
            middleware.send_response(req, res, "0", "fail to upload restaurant image", null);
        } else {
            middleware.send_response(req, res, "1", "upload success", { image: req.file.filename });
        }
    })
})

module.exports = router;