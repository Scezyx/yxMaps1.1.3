var Koa=require('koa'),
    app=new Koa(),
    router = require('koa-router')(),
    db = require('./db.js'), 
    https = require("https"),
    fs=require("fs"),
    sd = require('silly-datetime'),
    querystring=require("querystring"),
    sql ="",
    params={},
    path=require('path'),
    bodyParser = require('koa-bodyparser'),
    views = require('koa-views');
const qs = require('query-string');
const session = require('koa-session');
const static = require('koa-static');
app.use(bodyParser());
app.use(views(__dirname+'/view', { map: {html: 'ejs' }}));

app.keys = ['some secret hurr'];
const CONFIG = {
    key: 'koa:sess',
    maxAge: 86400000,
    autoCommit: true,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false,
    renew: false, 
};
app.use(session(CONFIG, app));

app.use(static(__dirname + '/static'));


//登陆
router.get("/login",async(ctx)=>{
    await ctx.render('login');
})
router.post('/doLogin',async(ctx)=>{
    let user = ctx.request.body;
    let tag=true;
    let userinfo;
    sql="select user_id,username,password,phone,user_type from userinfo where username=? and password=?";
    params=[user.username,user.password];
    db.query(sql,params,async(error, results, fields)=>{
        if (error) throw error;
        var file = path.join(__dirname, '/test1.json'); 
        results=JSON.stringify(results);
        //results=JSON.parse(results);
        //写入文件
        await fs.writeFile(file, results, function(err) {
            if (err) {
                return console.log(err);
            }
        }); 
    });
    let results=JSON.parse(fs.readFileSync('./test1.json','utf8'));
    if(results.length==0){
        await ctx.redirect('/login',{
            message:'用户名或密码错误'
        });
    }else{
        ctx.session.ui=results[0];
        //普通用户
        console.log(ctx.session.ui.user_type)
        if(ctx.session.ui.user_type==0){
            await ctx.redirect('/index',{
                userinfo:ctx.session.ui
            });
        }else if(ctx.session.ui.user_type==1){//商家
            await ctx.redirect('/dianpu_xiangqing',{
                userinfo:ctx.session.ui
            });
        }else{
            await ctx.redirect('/index',{
                userinfo:ctx.session.ui
            });
        }
    }
})

//商家
router.get("/dianpu",async(ctx)=>{
    await ctx.render('dianpu'); 
})
router.post("/doSj",async(ctx)=>{
    let user = ctx.request.body;
    sql="insert into shop set ?"
    console.log(user.address);
    let param=qs.stringify({
        'address':user.address,
        'output':'json',
        'ak':'0OAXnkBwezSXpCyuUF0E7pBmfTiw78lr'//服务端ak
    });
    https.get(
    {
        hostname: 'api.map.baidu.com',
        path: '/geocoding/v3/?' + param,
        agent: false
    },
    function (res) {
        // 在标准输出中查看运行结果
        //res.pipe(process.stdout);//管道流
        res.pipe(fs.createWriteStream('./baidu-token.json'));//将流写入文件
    });
    let results=JSON.parse(fs.readFileSync('./baidu-token.json','utf8'));
    user.lng=results.result.location.lng;
    user.lat =results.result.location.lat;
    params={shop_realname:user.shop_realname,address:user.address,lng:user.lng,lat:user.lat}
    console.log(user);
    db.query(sql,params,(error, results, fields)=>{
        if (error) throw error;
        console.log(results);
    });
    sql="select shop_id from shop where shop_realname=?";
    params=[user.shop_realname];
    let r_id;
    db.query(sql,params,(error, results, fields)=>{
        if (error) throw error;
        r_id=results;
        console.log(results);
    });
    sql="update userinfo set ?";
    params={shop_id:r_id,user_type:1};
    ctx.redirect('login',{
        message:'重新登陆'
    });
})

//店铺详情
router.get("/dianpu_xiangqing",async(ctx)=>{
    await ctx.render('dianpu_xiangqing');
})


//主页
router.get("/index",async(ctx)=>{
    sql='select * from shop where address like ?'
    let p=['重庆%'];
    db.query(sql,p,async(error, results, fields)=>{
        if (error) throw error;
        //console.log(results);
        var file = path.join(__dirname, '/test.json'); 
        results=JSON.stringify(results);
        //results=JSON.parse(results);
        //写入文件
        await fs.writeFile(file, results, function(err) {
            if (err) {
                return console.log(err);
            }
        }); 
    });
    let contentText = JSON.parse(fs.readFileSync('test.json','utf-8'));
    contentText=JSON.stringify(contentText);

  
    await ctx.render('index',{
        shopArray:contentText
    });
})


//预约
router.get("/confirm_order",async(ctx)=>{
    let [ pathname, queryStr ] = ctx.request.url.split('?');//分割请求
    let query = querystring.parse(queryStr);
    query=parseInt(query.shop_id);
    params=[query];
    sql="select * from shop where shop_id=?"
    db.query(sql,params,async(error, results, fields)=>{
        if (error) throw error;
        var file = path.join(__dirname, '/t.json'); 
        results=JSON.stringify(results);
        await fs.writeFile(file, results, function(err) {
            if (err) {
                return console.log(err);
            }
        }); 
    });
    let contentText = JSON.parse(fs.readFileSync('t.json','utf-8'));
    let qs={shop_id:contentText[0].shop_id,shop_realname:contentText[0].shop_realname,address:contentText[0].address};

    await ctx.render('confirm_order',{
        qs:qs,
        ui:ctx.session.ui
    });
})
router.post("/doCon",async(ctx)=>{
    let time = sd.format(new Date(), 'YYYY-MM-DD HH:mm');
    let info = ctx.request.body;
    sql = "insert orders set ?";
    params={user_id:ctx.session.ui.user_id,shop_id:info.shop_id,money:info.money,order_time:time,state:0};
    db.query(sql,params,async(error, results, fields)=>{
        if (error) throw error;
    });
    ctx.redirect('dingdan',{
        info:params
    })
})


//注册
router.get("/reg",async(ctx)=>{
    await ctx.render('reg');
})
router.post("/doReg",async(ctx)=>{
    let user = ctx.request.body;
    if(!(user.password===user.password1)){
        await ctx.render('reg',(ctx)=>{
        }); 
    }else{
        console.log(user);
        sql="insert into userinfo set ?";
        params={username:user.username,password:user.password,phone:user.phone,user_type:"0"};
        db.query(sql,params,(error, results, fields)=>{
            if (error) throw error;
            console.log(results);
        });
        ctx.redirect('/login');
    }
})


//订单
router.get("/dingdan",async(ctx)=>{
    sql="select * from orders where user_id=?";
    params=[ctx.session.ui.user_id];
    console.log(ctx.session.ui.user_id);
    db.query(sql,params,async(error, results, fields)=>{
        if (error) throw error;
        var file = path.join(__dirname, '/t1.json'); 
        results=JSON.stringify(results);
        await fs.writeFileSync(file, results, function(err) {
            if (err) {
                return console.log(err);
            }
        }); 
    });
    let contentText =fs.readFileSync('t1.json','utf-8');
    console.log(contentText);
    await ctx.render('dingdan',{
        info:contentText[0]
    });
})

router.get("/forget_password",async(ctx)=>{
    await ctx.render('forget_password');
})

router.get("/qianbao",async(ctx)=>{
    await ctx.render('qianbao');
})
app.use(router.routes())
   .use(router.allowedMethods());
app.listen(9990);