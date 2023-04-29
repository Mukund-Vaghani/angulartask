const { request } = require('express');
const Validator = require('Validator');
var con = require('../config/database');

var middleware = {
    checkVallidationRules: function(request,res,rules,message){
        const v = Validator.make(request, rules, message)
        if(v.fails()){
            const errors = v.getErrors();
            for(var key in errors){
                var error = errors[key][0];
                var response_data = {
                    code:'0',
                    message:error
                }
                res.status(200);
                res.send(response_data);
                return false;
            }
        }else{
            return true;
        }
    },

    send_response: function(req,res,code,message,data){
        if(data == null){
            var response_data = {
                code:code,
                message:message
            }
            res.status(200);
            res.send(response_data);
        }else{
            var response_data = {
                code:code,
                message:message,
                dat:data
            }
            res.status(200);
            res.send(response_data);
        }
    },

    validateApiKey: function(req,res,callback){
        var api_key = (req.headers['api-key'] != undefined && req.headers['api-key'] != '')?req.headers['api-key']:"";
        if(api_key != "" && api_key == process.env.API_KEY){
            callback();
        }else{
            var response_data={
                code:'0',
                message:'Invalid API Key'
            }
            res.status(401);
            res.send(response_data);
        }
    },  

    validateToken: function(req,res,callback){
        var end_point = req.path.split('/');
        var uni_end_point = new Array("login", "signup");
        var valid_token = (req.headers['token'] != undefined && req.headers['token'] != "")? req.headers['token']:"";

        if (uni_end_point.includes(end_point[4])) {
            callback();
        }else{

            if(valid_token){
                con.query(`SELECT * FROM tbl_user_deviceinfo WHERE token = ?`,[valid_token], function(error,result){
                    if(!error && result.length >0){
                        req.user_id = result[0].user_id;
                        callback();
                    }else{
                        var response_data = {
                            code:'0',
                            message:'Invalid Token'
                        }
                        res.status(401);
                        res.send(response_data);
                    }
                })
            }
        }
    }

}

module.exports = middleware;