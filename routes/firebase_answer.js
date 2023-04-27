// npm install firebase

// ref: https://firebase.google.com/docs/database/web/read-and-write

var express = require('express');
var router = express.Router();

const firebase = require('firebase-admin')
const uuidv4 = require('uuid/v4')
const jwt = require('jsonwebtoken')

var config = {
    databaseURL: "https://test.firebaseio.com/",
};

firebase.initializeApp(config);

var database = firebase.database();

// request body: req.body -> 提取request中body的值
// example:
// 假設這個request中，夾帶的body分為：
// + name: '蘋果' -> 若要提取該key的值可以輸入req.body.name
// + price: 5 -> 若要提取該key的值可以輸入req.body.price

// request query: req.query -> 提取request中夾雜在url中的值
// example:
// 假設url為「http://example.com/?id=1」 -> 若要提取id的值就可以輸入req.query.id

// ***「產品相關API」***

// + GET - 提取所有產品資料（包含產品名稱、價格）*********************
// + GET - 提取單一產品資料（包含產品名稱、價格）*********************
// + POST - 推送單一產品（包含產品名稱、價格）**********************
// + PUT - 更改產品（可選擇只修改產品名稱或只修改價格）***********
// + DELETE - 刪除產品 **********

// + POST - 推送單一產品（包含產品名稱、價格）
router.post('/product', function (req, res, next) {
    const name = req.body.name
    const price = req.body.price
    // 試著判斷前端在request中是否有正常的輸入request的key。
    if (name === undefined || price === undefined || name === '' || price === '') {
        res.status(400).json({
            result: '請在request的輸入name及price的key值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }
    firebase.database().ref('products/' + uuidv4()).set({
        // name: name,
        // price: price
        name,
        price
    });
    res.status(200).json({
        result: '產品新增成功'
    })
})

// + GET - 提取所有產品資料（包含產品名稱、價格）
router.get('/product/all', function (req, res, next) {
    firebase.database().ref('products/').once('value', function (snapshot) {
        // console.log(snapshot.val());
        res.status(200).json({
            result: snapshot.val()
        })
    });
})

// + GET - 提取單一產品資料（包含產品名稱、價格）
router.get('/product', function (req, res, next) {
    // console.log('query value: ', req.query.id)
    const id = req.query.id
    if (id === undefined || id === '') {
        res.status(400).json({
            result: '請在request的輸入id的query值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }
    firebase.database().ref('products/' + id).once('value', function (snapshot) {
        // console.log(snapshot.val());
        res.status(200).json({
            result: snapshot.val()
        })
    });
})

// update products set name = '西瓜' where id = '62ac05b6-cec6-4c8e-b95f-d836cf1e790c'

// + PUT - 更改產品（可選擇只修改產品名稱或只修改價格）
router.put('/product', function (req, res, next) {
    const id = req.query.id
    const name = req.body.name
    const price = req.body.price
    // 試著判斷前端在request中是否有正常的輸入request的key。
    if (id === undefined || id === '') {
        res.status(400).json({
            result: '請在query中輸入id值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }
    firebase.database().ref('products/' + id).update({
        name: name,
        price: price
    });
    res.json({
        result: '修改成功'
    })
})

// delete from products where id = ''

// + DELETE - 刪除產品
router.delete('/product', function (req, res, next) {
    const id = req.query.id
    if (id === undefined || id === '') {
        res.status(400).json({
            result: '請在query中輸入id值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }
    // remove -> 刪除指定users中指定對象的資料
    firebase.database().ref('products/' + id).remove()
    res.json({
        result: '刪除成功'
    })
})

// + POST - 會員註冊
router.post('/member', function (req, res, next) {
    const account = req.body.account
    const password = req.body.password
    // 試著判斷前端在request中是否有正常的輸入request的key。
    if (account === undefined || password === undefined || account === '' || password === '') {
        res.status(400).json({
            result: '請在request的輸入account及password的key值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }
    firebase.database().ref('members/' + uuidv4()).set({
        account,
        password
    });
    res.status(200).json({
        result: '會員註冊成功'
    })
})

// + POST - 會員登入
// (當使用者輸入正確的帳號密碼後，給予token。)
router.post('/member/login', function (req, res, next) {
    const account = req.body.account
    const password = req.body.password
    // 試著判斷前端在request中是否有正常的輸入request的key。
    if (account === undefined || password === undefined || account === '' || password === '') {
        res.status(400).json({
            result: '請在request的輸入account及password的key值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }

    // 帳號確認
    firebase.database().ref('members/').orderByChild('account').equalTo(account).on('value', function (snapshot) {
        if (snapshot.val() === null) {
            res.json({
                result: '無該帳號'
            })
            return
        }
        const token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: account
        }, 'secret');

        const decoded = jwt.verify(token, 'secret');

        res.json({
            token
        })
    });
})
// res.setHeader('token', token);
// res.json({
//     token: token
// })

// req.headers['token'];
// req.body.token
// req.query.token


// + GET - 取得全部訂單資料
// + GET - 取得特定訂單資料
// + POST - 新增訂單資料
// + PUT - 修改訂單資料
// + DELETE - 刪除訂單資料

// + POST - 新增訂單資料
// example: 
// http://localhost:3000/firebase/order/?token=?  --> ?部分填入相對應的token值
router.post('/order', function (req, res, next) {
    const productName = req.body.productName
    const quantity = req.body.quantity
    const token = req.query.token
    // 試著判斷前端在request中是否有正常的輸入request的key。
    if (productName === undefined || quantity === undefined || token === undefined || productName === '' || quantity === '' || token === '') {
        res.status(400).json({
            result: '請在request的body中輸入productName及quantity的key值，並在query中輸入token值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }
    jwt.verify(token, 'secret', function (err, decoded) {
        if (err) {
            // 如果認證發生問題，則印出錯誤
            console.log(err)
            res.status(400).json({
                err,
                message: 'token發生問題'
            })
            return
        }
        const account = decoded.data
        firebase.database().ref('orders/' + uuidv4()).set({
            account,
            productName,
            quantity,
        })
        res.status(200).json({
            result: '產品新增成功'
        })
    })
})

// + GET - 取得全部訂單資料
// example: 
// http://localhost:3000/firebase/order/?token=?  --> ?部分填入相對應的token值
router.get('/order/all', function (req, res, next) {
    const token = req.query.token
    if (token === undefined || token === '') {
        res.status(400).json({
            result: '請在query中輸入token值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }
    jwt.verify(token, 'secret', function (err, decoded) {
        if (err) {
            // 如果認證發生問題，則印出錯誤
            console.log(err)
            res.status(400).json({
                err,
                message: 'token發生問題'
            })
            return
        }
        firebase.database().ref('orders/').once('value', function (snapshot) {
            res.json({
                result: snapshot.val()
            })
        })
    })
})

// + GET - 取得特定訂單資料
// example: 
// http://localhost:3000/firebase/order/?token=?&id=?  --> ?部分填入相對應的token及id值
router.get('/order', function (req, res, next) {
    const id = req.query.id
    const token = req.query.token
    if (id === undefined || token === undefined || id === '' || token === '') {
        res.status(400).json({
            result: '請在request的輸入id的query及token值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }
    jwt.verify(token, 'secret', function (err, decoded) {
        if (err) {
            // 如果認證發生問題，則印出錯誤
            console.log(err)
            res.status(400).json({
                err,
                message: 'token發生問題'
            })
            return
        }
        firebase.database().ref('orders/' + id).once('value', function (snapshot) {
            // console.log(snapshot.val());
            res.status(200).json({
                result: snapshot.val()
            })
        })
    })
})

// + PUT - 修改訂單資料
// example: 
// http://localhost:3000/firebase/order/?token=?&id=?  --> ?部分填入相對應的token及id值
router.put('/order', function (req, res, next) {
    const id = req.query.id
    const productName = req.body.productName
    const quantity = req.body.quantity
    const token = req.query.token
    // 試著判斷前端在request中是否有正常的輸入request的key。
    if (id === undefined || productName === undefined || quantity === undefined ||
        token === undefined || id === '' || productName === '' || quantity === '' || token === '') {
        res.status(400).json({
            result: '請在request的body中輸入productName及quantity的key值，並在query中輸入id及token的query值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }
    jwt.verify(token, 'secret', function (err, decoded) {
        if (err) {
            // 如果認證發生問題，則印出錯誤
            console.log(err)
            res.status(400).json({
                err,
                message: 'token發生問題'
            })
            return
        }
        firebase.database().ref('orders/' + id).update({
            productName,
            quantity
        });
        res.json({
            result: '訂單修改成功'
        })
    })
})

// + DELETE - 刪除訂單資料
// example: 
// http://localhost:3000/firebase/order/?token=?&id=?  --> ?部分填入相對應的token及id值
router.delete('/order', function (req, res, next) {
    const id = req.query.id
    const token = req.query.token
    if (id === undefined || token === undefined || id === '' || token === '') {
        res.status(400).json({
            result: '請在query中輸入id及token值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }
    jwt.verify(token, 'secret', function (err, decoded) {
        if (err) {
            // 如果認證發生問題，則印出錯誤
            console.log(err)
            res.status(400).json({
                err,
                message: 'token發生問題'
            })
            return
        }
        // remove -> 刪除指定users中指定對象的資料
        firebase.database().ref('orders/' + id).remove()
        res.json({
            result: '訂單刪除成功'
        })
    })
})

//==================顧客方的會員

router.get('/getdata', function (req, res, next) {
    // 取得users中id為124的會員資料
    firebase.database().ref('users/124').once('value', function (snapshot) {
        // console.log(snapshot.val());
        res.status(200).json({
            result: snapshot.val()
        })
    });
})

router.get('/getalldata', function (req, res, next) {
    // 取得users中全部的資料
    firebase.database().ref('users/').once('value', function (snapshot) {
        // console.log(snapshot.val());
        res.status(200).json({
            result: snapshot.val()
        })
    });
})



router.post('/postdata', function (req, res, next) {
    // 試著判斷前端在request中是否有正常的輸入request的key。
    const username = req.body.username
    const email = req.body.email
    console.log('username: ', username)
    console.log('email: ', email)

    if (username === undefined || email === undefined || username === '' || email === '') {
        res.status(400).json({
            result: '請在request的輸入username及email的key值。'
        })
        // 若沒加該行return會造成一個重複給response中的錯誤
        return
    }

    // set -> 在users中建立新的資料，並使用uuid來做唯一值（與資料庫的id概念類似，可想像成「primary key」）
    firebase.database().ref('users/' + uuidv4()).set({
        username: req.body.username,
        email: req.body.email
    });
    res.status(200).json({
        result: '會員註冊完成'
    })
})

router.put('/putdata', function (req, res, next) {
    // update -> 更改在users中指定的對象的資料
    firebase.database().ref('users/' + '124').update({
        username: req.body.username,
        email: req.body.email
    });
    res.json({
        result: '修改成功'
    })
})

router.delete('/deletedata', function (req, res, next) {
    // remove -> 刪除指定users中指定對象的資料
    firebase.database().ref('users/' + '123').remove()
    res.json({
        result: '刪除成功'
    })
})

module.exports = router;
