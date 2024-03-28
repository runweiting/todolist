// 1. 載入 http
const http = require("http");
const { v4: uuidv4 } = require("uuid");
const errorHandle = require("./errorHandle");
// 暫存在 node.js 的記憶體上
const todos = [];
// 3. function 抽出來
// 使用者造訪網站時，函式被觸發，request 夾帶使用者資訊傳來，接著可以針對使用者資料作判斷
const requestListener = (request, response) => {
  // 把 headers 抽出來
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json",
  };
  // 接收資料用的 body 字串
  let body = "";
  // 接收資料用的 on data
  request.on("data", (chunk) => {
    body += chunk;
  });
  // 如果使用者用 GET 造訪首頁
  if (request.url == "/todos" && request.method == "GET") {
    response.writeHead(200, headers);
    // JSON.stringify 把回傳的 json 格式轉為字串，因為網路請求只看的懂字串，不然網路封包無法解析
    // 實際上回傳資料是物件格式，但因為 "Content-Type": "application/json" 所以瀏覽器會把資料轉成 json 格式
    response.write(
      JSON.stringify({
        status: "success",
        data: todos,
      })
    );
    response.end();
    // 如果使用者用 POST 造訪首頁
  } else if (request.url == "/todos" && request.method == "POST") {
    // 接收資料用的 on end，確保 body 有資料
    request.on("end", () => {
      try {
        // 從使用者輸入的字串來組資料
        const title = JSON.parse(body).title;
        // 判斷 title 是否有值
        if (title !== undefined && title !== "") {
          const todo = {
            title: title,
            id: uuidv4(),
          };
          todos.push(todo);
          response.writeHead(200, headers);
          response.write(
            JSON.stringify({
              status: "success",
              data: todos,
            })
          );
          response.end();
        } else {
          errorHandle(response);
        }
      } catch {
        errorHandle(response);
      }
    });
    // 如果使用者用 DELETE 造訪首頁
  } else if (request.url == "/todos" && request.method == "DELETE") {
    // 清除 todos 陣列資料
    todos.length = 0;
    response.writeHead(200, headers);
    response.write(
      JSON.stringify({
        status: "success",
        data: todos,
      })
    );
    response.end();
  } else if (request.url.startsWith("/todos/") && request.method == "DELETE") {
    // id 是否存在
    const id = request.url.split("/").pop();
    // 因為 todos 是陣列、todo 是物件，所以要比對找出正確的索引來刪除
    const index = todos.findIndex((element) => element.id == id);
    if (index !== -1) {
      todos.splice(index, 1);
      response.writeHead(200, headers);
      response.write(
        JSON.stringify({
          status: "success",
          data: todos,
        })
      );
      response.end();
    } else {
      errorHandle(response);
    }
    // 加入 prefight options API 機制
  } else if (request.url.startsWith("/todos/") && request.method == "PATCH") {
    request.on("end", () => {
      try {
        const title = JSON.parse(body).title;
        const id = request.url.split("/").pop();
        const index = todos.findIndex((element) => element.id == id);
        if (title !== undefined && title !== "" && index !== -1) {
          todos[index].title = title;
          response.writeHead(200, headers);
          response.write(
            JSON.stringify({
              status: "success",
              data: todos,
            })
          );
          response.end();
        } else {
          errorHandle(response);
        }
      } catch {
        errorHandle(response);
      }
    });
  } else if (request.method === "OPTIONS") {
    response.writeHead(200, headers);
    response.end();
    // 如果使用者造訪不存在路由
  } else {
    response.writeHead(404, headers);
    response.write(
      JSON.stringify({
        status: "false",
        message: "沒有這個路由",
      })
    );
    response.end();
  }
};
// 2. 使用 createServer
const server = http.createServer(requestListener);
// 4. 監聽 3005
server.listen(3005);
