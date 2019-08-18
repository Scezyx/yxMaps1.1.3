var db={}
var mysql= require('mysql');

var pool = mysql.createPool({
  host     : 'localhost',//'129.28.162.50',
  user     : 'root',
  password : 'root',//'kdm001',
  port: '3306',
  database : 'yxmaps'
});

/**查询 */
db.query = function(sql,params,callback){ 
  
  if (!sql) { 
    callback(); 
    return; 
  } 
  pool.query(sql,params,function(err, rows, fields) { 
   if (err) { 
    console.log(err); 
    callback(err, null); 
    return; 
   }; 
  
   callback(null, rows, fields); 
  }); 
} 
/*db.query = function(sql,params,callback){ 
  var promise = new Promise(function (resolve, reject) {
  if (!sql) { 
    callback(); 
    return; 
  } 
  pool.query(sql,params,function(err, rows, fields) { 
  
   if (err) { 
    console.log(err); 
    callback(err, null); 
    return; 
   }; 
   resolve(rows);
   callback(null, rows, fields); 
  }); 
  promise.then(function (value) {
    console.log(value);
    return value;
  }, function (value) {});
  return promise;
  })
} */
module.exports = db; 