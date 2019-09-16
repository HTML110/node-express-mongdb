var express=require("express");
var fs=require("fs");
var app=express();
//控制器
var router=require("./router/router.js");

var session = require('express-session');
//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
//设置模板
app.set("view engine","ejs");
//路由中间件，静态页面
app.use(express.static("./public"));



var path = require('path');
var ueditor = require("ueditor");
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use("/ueditor/ue", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
    // ueditor 客户发起上传图片请求
    if (req.query.action === 'uploadimage') {
        var foo = req.ueditor;
        var imgname = req.ueditor.filename;
        var img_url = '/images/ueditor/';
        //你只要输入要保存的地址 。保存操作交给ueditor来做
        res.ue_up(img_url);
    }
    //  客户端发起图片列表请求
    else if (req.query.action === 'listimage') {
        var dir_url = '/images/ueditor/';
        // 客户端会列出 dir_url 目录下的所有图片
        res.ue_list(dir_url);
    }
    // 客户端发起其它请求
    else {
        res.setHeader('Content-Type', 'application/json');
        res.redirect('/ueditor/nodejs/config.json');
    }
}));






//设置路由
app.get("/denglu",router.showdenglu);
app.post("/dodenglu",router.showdodenglu); //检验登录密码
app.get("/fabiao",router.showfabiao);
app.post("/dofabiao",router.showdofabiao);
app.get("/",router.showIndex);
app.get("/life",router.showLife);
app.get("/getsum",router.getsum); //得到说说的总数
app.get("/article",router.article);
app.get("/text",router.showtext);//查看完整文章
app.get("/xiugai",router.xiugai);//用来修改文章
app.get("/delete",router.showdelete);//删除某一篇文章
app.get("/doxiugai",router.showdoxiugai);//修改某一篇文章
app.post("/dodoxiugai",router.dodoxiugai);//彻底修改一篇文章
app.get("/getgoods",router.getgoods);//请求得到推荐的文章


app.get("/typearticle",router.typearticle); //得到分类文章的数目
app.get("/allarticle",router.showallarticle);//得到所有文章
app.get("/recently",router.recently);

app.get("/onearticle",router.getonearticle);//得到一篇文章

app.get("/it",router.showIt);

app.get("/successful",router.showSuccessful);
app.get("/conclusion",router.showConclusion);
app.get("/message",router.showMessage);
app.get("/me",router.showMe);
app.get("/admin",router.doadmin)//修改登录信息
app.post("/dodoadmin",router.showdoadmin)//修改登录信息


app.get("*",function(req,res){
    res.render("notfind");
});

app.listen(3000);
