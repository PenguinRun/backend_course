// npm install firebase

// ref: https://firebase.google.com/docs/database/web/read-and-write

var express = require('express');
var router = express.Router();

const firebase = require('firebase')

// set middleware
router.use('/',function (req, res, next) {
    const onTime = new Date()
    console.log(onTime)
    next()
  })

router.get('/', function (req, res, next) {

    var config = {
        databaseURL: "https://test.firebaseio.com/" // enter your databaseURL（輸入由firebase中申請到的firebase的databaseURL）
    };

    firebase.initializeApp(config);

    // Get a reference to the database service
    var database = firebase.database();

     // set -> 建立新的資料
    firebase.database().ref('users/' + '123').set({
        username: 'wwwww',
        email: 'test@gmail.com'
    });

    // update -> 更新指定資料
    firebase.database().ref('users/' + '223').update({
        username: 'wwwww',
        email: 'tes2t@gmail.com'
    });

    // once -> 取得資料
    firebase.database().ref('users/').once('value', function (snapshot) {
        console.log(snapshot.val());
        res.json({
          
        })
    });

    // remove -> 刪除指定資料
    firebase.database().ref('users/' + '123').remove()

});

module.exports = router;
