var db=require("../model/db.js");
var formidable=require("formidable");
var path = require("path");
var fs = require("fs");
var sb = require('silly-datetime');

var express=require('express');
var app=express();

var ueditor = require("ueditor");
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());



app.use("/ueditor/ueditor", ueditor(path.join(__dirname, 'public'), function(req, res, next) {
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

//显示登录页面
exports.showdenglu=function(req,res,next){

  res.render("denglu");
}
//处理登录密码
exports.showdodenglu=function(req,res,next){

    var form = new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        
         var username=fields.username;
         var password=fields.password;
        
        db.find("admin",{"username":username},function(err,result1){
                      if(err){
                        res.render("yonghu");
                      }
                

                  if(result1[0].password==password){

                  db.find("works",{},function(err,result){

                       req.session.login = "1";
                       res.render("xiugai",{"result":result});
                    });

                }else{
                  res.render("mima");

                }


               
            
    
        });

    });
};

//发表说说
exports.showfabiao=function(req,res,next){
     if(req.session.login=="1"){
       res.render("fabiao");

     }else{
      res.render("no");
     }
      
};
//处理说说
exports.showdofabiao=function(req,res,next){
    if(req.session.login=="1"){
         var form = new formidable.IncomingForm();


       form.uploadDir = path.normalize(__dirname + "/../public/img");
      
    

       var time=sb.format(new Date(), 'YYYY-MM-DD');
       form.parse(req,function(err, fields,files) {
       
      var ttt=sb.format(new Date(), 'YYYYMMDDHHmmss');
      var ran=parseInt(Math.random()*89999+10000);
      var extname=path.extname(files.tupian.name);

       var oldpath=files.tupian.path;
       // var newpath=path.normalize(__dirname+"/../public/img/"+ttt+ran+extname);
        var newpath=path.normalize(__dirname+"/../public/img/"+files.tupian.name);

       fs.rename(oldpath,newpath,function(erer){

   
         var title=fields.title;
         var author=fields.author;
         var looker=fields.looker;
         var speaker=fields.speaker;
         var alltype=fields.alltype;
         var content=fields.content;
         var describe=fields.describe;
         var good=fields.good;
         var skills=fields.skills;
      
         var tupian=files;

  db.insertOne("works",{
            "title":title,
            "author":author,
            "looker":looker,
            "speaker":speaker,
            "alltype":alltype,
            "content":content,
            "describe":describe,
            "datetime":time,
            "good":good,
            "skills":skills,
            "tupian":tupian
            },function(err,result){
             if(err){
                console.log(err);
             res.send("-2"); //发表失败
             return;
            }else{
             res.send("发表成功");   //发表成功
             }
       });

       });
    
     });

    }else{
      res.render("no");
    }
     
}

//首页
exports.showIndex=function(req,res,next){
    db.find("works",{},function(err,result){
        res.render("index",{"result":result,"type":"首页"});

    })

       
};

//得到文章总数

exports.getsum=function(req,res,next){
   db.getAllCount("works",function(count){
      res.send(count.toString());
   }); 

};

//获取文章并显示
exports.article=function(req,res,next){
    var page=req.query.page;
    db.find("works",{},{"pageamount":6,"page":page,"sort":{"datetime":-1}},function(err,result){
           res.send(result);
      });
}

// 查看具体文章
exports.showtext=function(req,res,next){
      var title=req.query.title;
      db.find("works",{"title":title},{"sort":{"datetime":-1}},function(err,result2){
         if(parseInt(result2[0])){
			 var sum=parseInt(result2[0].looker)+1;
         db.updateMany("works",{"title":title},{ $set:{looker:sum}, },function(err,result1){
			  db.find("works",{"title":title},{"sort":{"datetime":-1}},function(err,result){
				   res.render("text",{
                    "result":result,
                    "title":title
                });
			  });		
       }); 
			 
		 }else{
			 	
			  db.find("works",{"title":title},{"sort":{"datetime":-1}},function(err,result){
				   res.render("text",{
                    "result":result,
                    "title":title
                });
			  });		
 
			 
		 }
    

      });
};

//分类
exports.typearticle=function(req,res,next){
     var type=req.query.type;
      
     db.find("works",{"alltype":type},function(err,result){
            res.json(result);
     }); 

};

//生活点滴目录下的分页
exports.showLife=function(req,res,next){
          var type=req.query.type;
       db.find("works",{},{"pageamount":200,"page":0,"sort":{"datetime":-1}},function(err,result){

        res.render("life",{"result":result,"type":type});
     }); 

};

//文章推荐
exports.recently=function(req,res,next){

  var good=req.query.good;
   // console.log(good);
   
    // db.find("works",{"good":good},function(err,result){

    //       res.json(result);
    //  }); 

};

//删除某一篇文章
exports.showdelete=function(req,res,next){

    if(req.session.login=="1"){
       var title=req.query.title;
     db.deleteMany("works",{"title":title},function(err,result){
             if(err){

              return;
             }
             res.send("删除成功");
     })

    }else{

      res.render("no");
    }
     
};

//修改一篇文章（先呈现出来）
exports.showdoxiugai=function(req,res,next){
    
   if(req.session.login=="1"){
      var title=req.query.title;
    //  console.log(title);
    db.find("works",{"title":title},function(err,result){
    
       // console.log(result);

       res.render("doxiugai",{"result":result});
   
    });

   }else{
    res.render("no");
   }
   

};
//彻底修改一篇文章


exports.dodoxiugai=function(req,res,next){
    if(req.session.login=="1"){
         var tm=req.query.title;
     var form = new formidable.IncomingForm();
      form.parse(req,function(err, fields,files){
       
         var biaoti=fields.title;
         var zuozhe=fields.author;
         var ll=fields.looker;
         var pinglun=fields.speaker;
         var lx=fields.alltype;
         var nr=fields.content;
         var ms=fields.describe;
       
    db.updateMany("works",{"title":tm},{
      $set:{title:biaoti,author:zuozhe,looker:ll,speaker:pinglun,alltype:lx,content:nr,describe:ms},

      },function(err,result){
             if(err){
               
             res.send("-2"); //发表失败
                 return;
            }else{
              res.redirect("/xiugai");
             // res.send("更改成功");   //发表成功
             }
       });
  
   
     });


    }else{
      res.render("no");

    }
  
};

//显示所有数据
exports.xiugai=function(req,res,next){

     if (req.session.login == "1") {

 db.find("works",{},function(err,result){
  // console.log(result[24].tupian.tupian.name);
    res.render("xiugai",{"result":result});
 
 });


        
    } else {
        // res.send("对不起你无权访问此网页！！！请登录！！！！")
        res.render("no");
    }


};

//请求得到推荐的文章
exports.getgoods=function(req,res,next){
   db.find("works",{"good":"文章推荐"},{"pageamount":200,"page":0,"sort":{"datetime":-1}},function(err,result){
    
        res.json(result);
    
   });

};

//得到一篇文章
exports.getonearticle=function(req,res,next){
  var title=req.query.title;
 // console.log(title);
   db.find("works",{"title":title},function(err,result){
   //   console.log(result);
         res.json(result);

   });

};

//得到所有文章
exports.showallarticle=function(req,res,next){
  db.find("works",{},{"sort":{"datetime":-1}},function(err,result){
       res.json(result);
  });

}


exports.showIt=function(req,res,next){

    var type=req.query.type;
       db.find("works",{},{"sort":{"datetime":-1}},function(err,result){

        res.render("it",{"result":result,"type":type});
     }); 
  
}
exports.showSuccessful=function(req,res,next){

        var type=req.query.type;
       db.find("works",{},{"sort":{"datetime":-1}},function(err,result){

        res.render("successful",{"result":result,"type":type});
     }); 
   
}

exports.showMessage=function(req,res,next){
          var type=req.query.type;

    db.find("works",{},{"sort":{"datetime":-1}},function(err,result){

        res.render("message",{"result":result,"type":type});
     }); 
      
         

}

exports.showConclusion=function(req,res,next){
     var type=req.query.type;
         db.find("works",{},{"sort":{"datetime":-1}},function(err,result){
        
          res.render("conclusion",{"result":result,"type":type});
       }); 

}

exports.showMe=function(req,res,next){

      var type=req.query.type;
       db.find("works",{},{"sort":{"datetime":-1}},function(err,result){

        res.render("me",{"result":result,"type":type});
     }); 
         
 
    
};

exports.doadmin=function(req,res,next){
   if(req.session.login=="1"){
   db.find("admin",{},function(err,result){
       res.render("admin",{"result":result});

   });

   }else{

     res.render("no");
   }


}
exports.showdoadmin=function(req,res,next){
  if(req.session.login=='1'){
     var form = new formidable.IncomingForm();
      form.parse(req,function(err, fields,files){
         var xm=fields.username;
         var mm=fields.password;
    db.find("admin",{},function(err,result1){
        
        var us=result1[0].username;
      
    
    db.updateMany("admin",{"username":us},{
      $set:{username:xm,password:mm},

      },function(err,result){
             if(err){
             res.send("修改失败，请重新修改！！"); //发表失败
            }else{
              res.send("修改成功！！！")
            
             
             }
        });

       });

      });
     }else{
    res.render("no");
  }
}
