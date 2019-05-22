//引入node的http及querystring模組。
const http = require("http");
const queryString = require("querystring");

// 3. 如果要指定api url跟HTTP的method該怎麼做？

//定義個function來處理即將到來的http request.
requestHandler = (request, response) => {
    console.log("this request from " + request.url);
    console.log("this request method: " + request.method);

    // if (request.url === "/customer" && request.method === "POST") {
    //     response.end("hi customer");
    // }

    let getDatas = [];
    // 1. 接受來自client傳來夾雜在request中的資料
    // request.on = https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/#request-body
    request.on('data', (chunk) => {
        // console.log("chunk: " + chunk);
        getDatas.push(chunk);
        // console.log("getDatas: " + getDatas);
    }).on('end', () => { //在end event觸發後，透過querystring模組來將post的資料剖析成POST method的request格式，並向client端返回資料.
        // console.log('origin: ' + getDatas)
        // string格式的回傳
        response.end("hi, 我收到了「" + getDatas + "」的資料了.");

        // 2. 使用querystring parse來解析資料格式為Object格式
        getDatas = queryString.parse(getDatas.toLocaleString());
        // queryString.parse = https://nodejs.org/api/querystring.html#querystring_querystring_parse_str_sep_eq_options

        // console.log("after: " + typeof (getDatas));
        console.log("after: ", getDatas);

        // const json = JSON.stringify({
        //     getDatas
        // });
        // response.end(json)
    })



}

//使用http模組來建立一個server，並使用上述定義的function來處理request.
const server = http.createServer(requestHandler);

//啟動server並使用3000的port.
server.listen(3000);


//querystring.parse()它是用來將URL中的query string轉成為key跟value的配對。

//example: 

// query string: 'test1=hi&test2=all&test3=no&test3=no'

// {
//   test1: 'hi',
//   test2: all,
//   test3: ['no', 'no']
// }
