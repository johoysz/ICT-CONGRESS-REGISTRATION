const express = require("express");
const path = require("path");
const app = express();
//

const users = [
	{'username':'admin','password':'user'}
];

app.use(express.static(path.join(__dirname,"/public")));
app.use(express.urlencoded({"extended":true}));
app.use(express.json());

app.get("/studentlist",(req,res)=>{ res.status(200).send(slist);});

app.get("/",(req,res)=>{
	res.render("index.html");
});

app.post("/userlogin",(req,res)=>{
    let username = req.body.username;
    let password = req.body.password;
    let existingUsers = JSON.parse(req.body.users);

if(existingUsers != []) {
    existingUsers.forEach(element => {
        users.push({'username':element.idno,'password':element.pass})
    });
}

let user = users.filter(el=>el.username == username && el.password == password);
res.status(200).send(user);
})
app.listen("4321",()=>{
console.log("listening at port 4321");
});