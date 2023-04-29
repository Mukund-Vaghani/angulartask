var con = require('../../../config/database');
var common = require('../../../config/common');
var global = require('../../../config/constant');


var auth = {

    signup: function(request,callback){
        var userDetail = {
            user_name: request.user_name,
            email: request.email,
            user_password: request.user_password
        }

        auth.checkUserEmail(request.email, function(isExist){
            if(isExist){
                callback('0','Sorry, the email address you entered  is already associated with an existing account.',null)
            }else{
                con.query(`INSERT INTO tbl_user SET ?`,[userDetail],function(error,result){
                    if(!error){
                        var id = result.insertId;
                        common.checkUpdatoken(id,request,function(token){
                            if(token){
                                auth.userDetail(id,function(userData){
                                    if(userData){
                                        userData[0].token = token;
                                        callback('1','Congratulations! your account has been created successfully. you can now log in using your username and password',userData);
                                    }else{
                                        callback('0','Something went wrong. Please try again later.',null)
                                    }
                                })
                            }else{
                                callback('0','something went wrong',null);
                            }
                        })
                    }else{
                        console.log("signup",error);
                        callback('0','Sorry, weencountered an error while processing your request. Please try again later.',null)
                    }
                })
            }
        })
    },

    login: function(request,callback){
        con.query(`SELECT * FROM tbl_user WHERE user_name = ? AND user_password = ? AND is_active = '1' AND is_delete = '0'`,[request.user_name,request.user_password], function(error, result){
            if(!error && result.length>0){
                var id = result[0].id;
                auth.loginStatusUpdate(id,function(isUpdate){
                    if(isUpdate){
                        common.checkUpdatoken(id,request,function(token){
                            result[0].token = token;
                            callback('1','Welcome back! you have successfully logged in to your account.',result);
                        })
                    }else{
                        callback("0", "login status not update", null)
                    }
                })
            }else{
                console.log(error);
                callback('0','Sorry, we could not log you in with the credentials provided. Please check your user name and password and try again.',null);
            }
        })
    },

    logoutUser: function (id, callback) {
        var upddata = {
            token: "",
            device_token: ""
        }
        con.query(`UPDATE tbl_user_deviceinfo SET ? WHERE user_id = ?`, [upddata, id], function (error, result) {
            console.log(result)
            if (!error && result.affectedRows > 0) {
                var loginstatus = {
                    is_active:'0',
                    is_delete:'1',
                    login_status: "0"
                }

                con.query(`UPDATE tbl_user SET ? WHERE id = ?`, [loginstatus, id], function (error, result) {
                    if (!error && result.affectedRows > 0) {
                        callback('1', "log out", null);
                    } else {
                        callback("0", "", null);
                    }
                })
            } else {
                console.log(error)
                callback("0", "log out failed", null)
            }
        })
    },

    listing: function(request,callback){
        con.query(`SELECT user_name,email,user_password,CONCAT('${global.BASE_URL}','${global.USER_URL}', user_profile) as profile FROM tbl_user WHERE is_active = '1' AND is_delete = '0'`, function(error, result){
            if(!error && result.length>0){
                callback('1','success',result);
            }else{
                console.log(error);
                callback('0','something went wrong',null);
            }
        })
    },


    checkUserEmail: function(email,callback){
        con.query(`SELECT * FROM tbl_user WHERE email = ?`,[email], function(error,result){
            if(!error && result.length > 0){
                console.log("user email check")
                callback(true);
            }else{
                console.log("user email check",error);
                callback(false);
            }
        })
    },

    userDetail: function(id,callback){
        con.query(`SELECT user_name,email,user_password,CONCAT('${global.BASE_URL}','${global.USER_URL}', user_profile) as profile FROM tbl_user WHERE id = ?`,[id],function(error,result){
            if(!error && result){
                callback(result)
            }else{
                console.log(error);
                callback(null);
            }
        })
    },

    loginStatusUpdate: function (id, callback) {
        var loginstatus = {
            login_status: "1"
        }
        con.query(`UPDATE tbl_user SET ? WHERE id = ?`, [loginstatus, id], function (error, result) {
            if (!error) {
                callback(true);
            } else {
                callback(false);
            }
        })
    },


    //**************************Ads**************************/ 

    addAds: function(request,id,callback){
        var insertobj = {
            user_id:id,
            title:request.title,
            description:request.description,
            photo_url:request.photo_url
        }
        con.query(`INSERT INTO tbl_ads SET ?`,[insertobj], function(error,result){
            if(!error){
                auth.addDetail(id,function(adsData){
                    if(adsData){
                        callback('1','data add successfully',adsData);
                    }else{
                        callback('0',"something went wrong",null);
                    }
                })
            }else{
                callback('0','something went wrong',null);
            }
        })
    },

    adsListing: function(request,page,limit,callback){
        con.query(`SELECT user_id,title,description,CONCAT('${global.BASE_URL}','${global.USER_URL}', photo_url) as profile FROM tbl_ads WHERE is_active = '1' AND is_delete = '0' limit ${limit} offset ${(page-1)*limit}`,function(error,result){
            if(!error && result.length >0){
                callback('1',"success",result);
            }else{
                console.log(error);
                callback('0','something went wrong',null);
            }
        })
    },

    addDetail: function(id,callback){
        con.query(`SELECT * FROM tbl_ads WHERE id = ?`,[id], function(error,result){
            if(!error && result.length>0){
                callback(result);
            }else{
                callback(null);
            }
        })
    }

}

module.exports = auth;