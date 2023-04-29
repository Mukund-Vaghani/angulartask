var con = require('../config/database')
var common = {

    checkUpdatoken: function(user_id,request,callback){
        var randtoken = require('rand-token').generator();
        var userSession = randtoken.generate(64, '0123456789abcdefghijklmnopqrstuvwxyz');

        con.query(`SELECT * FROM tbl_user_deviceinfo WHERE user_id = ?`,[user_id], function(error, result){
            if(!error && result.length>0){
                var deviceparams = {
                    device_type: (request.device_type != undefined) ? result.device_type : "A",
                    device_token: (request.device_token!= undefined) ? result.device_token : "0",
                    token: userSession
                }
                con.query(`UPDATE tbl_user_deviceinfo SET ? WHERE user_id = ?`, [deviceparams, user_id], function (error, result) {
                    callback(userSession);
                });
            }else{
                var deviceparams = {
                    device_type: (request.device_type != undefined) ? result.device_type : "A",
                    device_token: (request.device_token!= undefined) ? result.device_token : "0",
                    token: userSession,
                    user_id: user_id
                }
                con.query(`INSERT INTO tbl_user_deviceinfo SET ?`, [deviceparams], function (error, result) {
                    callback(userSession);
                });
            }
        })
    }

}
module.exports = common;