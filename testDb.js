var db = require('./db.js'); 
var sql = 'select * from shop where address like "重庆%"';
//'insert into user set ?';
//'update user set ? where id=0'
// where username=? and password=?';
//; 
var zj;
var params={}//{username:"lb",password:"lb123",sex:"1",type:"1"};
db.query(sql,params,(error, results, fields)=>{
  if (error) throw error;
  console.log(results);
});