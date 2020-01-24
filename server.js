var mysql = require('mysql');
var cors = require('cors');

var config = require('./config.js');

var con = mysql.createConnection(config);

var express = require('express'),
app = express(),
port = process.env.port || 3000;


app.use(cors());

app.listen(port);


const bodyparser = require("body-parser");
//bodyparser.urencoded(options)
//parses the text as URL encoded data
//and exposes the resulting object


app.use(bodyparser.urlencoded({
    extended:true
}));

app.use(bodyparser.json());


//GET DATA FROM THE DATABASE

//get all data from the SQL.
  
    
app.post('/getusers',(req,res)=>{
    var sql = "select * from users";
    con.query(sql, function(err,result){
        if(err) throw err;
        console.log(result);
        res.send(result);
    });
});

app.post('/getrequests',(req,res)=>{
    var sql = "select * from fund_requests";
    con.query(sql, function(err,result){
        if(err) throw err;
        res.send(result);
    });
});


//get specific data from SQL table

app.post('/getuser/:id',(req,res)=>{
    var urlID = req.params.id;
    var sql = 'select * from users where user_id =?';
    var params = [urlID];
    con.query(sql,params, function(err,result){
        if(err) throw err;
        res.send(result);
    });
});


app.post('/getrequest/:id',(req,res)=>{
    var urlID = req.params.id;
    var sql = "select * from fund_requests where request_id=?";
    var params = [urlID];
    con.query(sql,params,function(err,result){
        if(err) throw err;
        res.send(result);
    });
});


//insert data into the SQL table

app.post('/setuser', (req,res)=>{
    var sql = 'insert into users(username,email,password) values(?,?,?)';
    var params = [req.body.username,req.body.email,req.body.password];
    con.query(sql,params, function(err){
        if (err) throw err;
        res.send('Successfully Added');
    });
});


app.post('/setrequest',(req,res)=>{
        var sql = 'insert into fund_requests(description,requested_amount,created_by_id) values (?,?,?)';
        var params = [req.body.description,req.body.requested_amount,req.body.created_by_id];
        con.query(sql,params, function(err,rows){
            if(err) throw err;
            res.send('Successfully Added');
            //console.log(rows);
    });
});


//SEND AND RECEIVE DATA FROM THE DATABASE   

app.post('/login',(req,res)=>{
    var sql = "select * from users where email=? and password =?";
    var params = [req.body.email,req.body.password];
    console.log(params);
    con.query(sql,params, function(err,data){
        if (err){
            res.json(err);
        }else{
            if(data.length == 1){
                res.json(data[0]);
            }else{
                res.json({"errorMessage":"invalid Credentials"});
            }
        }
    });
});



app.post('/donate',(req,res)=>{
    var sql = "insert into user_donations(user_id,request_id,donated_amount) values (?,?,?)";
    var params = [req.body.user_id,req.body.request_id,req.body.donated_amount];
    con.query(sql,params, function(err,data){
        if(err){
            res.json(err);
        }else{
        res.send("donated Successfully");
        }
    });
});


app.post('/myDonations/:id',(req,res)=>{
    var urlID = req.params.id;
    var sql = "select * from user_donations where user_id=?";
    var params = [urlID];
    con.query(sql,params, function(err,result){
        if(err) throw err;
        res.send(result);
    });
});


//---------------------------------------------------------------------


app.get('/getadmin_users',(req,res)=>{
    var sql = "select * from admin_users";
    con.query(sql, function(err,result){
        if(err) throw err;
        console.log(result);
        res.send(result);
    });
});


app.post('/getadmin_user/:id',(req,res)=>{
    var urlID = req.params.id;
    var sql = 'select * from admin_users where user_id =?';
    var params = [urlID];
    con.query(sql,params, function(err,result){
        if(err) throw err;
        res.send(result);
    });
});



app.post('/register',(req,res)=>{
    var sql = "insert into admin_users (username,email,password) values (?,?,?)";
    var params = [req.body.username,req.body.email,req.body.password];
    con.query(sql,params, function(err){
        if(err) throw err;
        res.send('Registered Successfully');
    });
});


app.post('/aLogin',(req,res)=>{
    var sql = "select * from admin_users where email=? and password=?";
    var params = [req.body.email,req.body.password];
    con.query(sql,params, function(err,data){
        if(err) {
            res.json(err);
        }else{
            if(data.length == 1){
                res.json(data[0]);
            }else{
                res.json({"errorMessage":"Invalid Credentials"});
            }
        }
    });
});


//view specific donations

app.get('/viewRequests/:id',(req,res)=>{
    var sql = "SELECT F.request_id,F.description,F.requested_amount,SUM(donated_amount)AS total_donated_amount FROM fund_requests F,user_donations D WHERE F.request_id = D.request_id  AND F.created_by_id =? GROUP BY F.request_id";
    var params=[req.params.id];
    console.log(params);
    con.query(sql,params, function(err,data){
        if(err) throw err;
        console.log(data);
        res.send(data);
    });
}); 



app.get('/viewRequests/:id/requestId/:reqId',(req,res)=>{
    var sql = "SELECT F.request_id,F.description,F.requested_amount,SUM(donated_amount)AS total_donated_amount FROM fund_requests F,user_donations D WHERE F.request_id = D.request_id  AND F.created_by_id =? AND F.request_id=? GROUP BY F.request_id ;";
    var params = [req.params.id,req.params.reqId];
    console.log(params);
    con.query(sql,params, function(err,data){
        if(err) throw err;
        console.log(data);
        res.send(data);
    });
});


app.get('/viewDonations/:id',(req,res)=>{
    var sql = "SELECT D.donation_id, D.request_id, U.username,donated_amount AS donation,donated_on FROM user_donations D,users U WHERE  U.user_id = D.user_id AND request_id =?";
    var params = [req.params.id];
    con.query(sql,params, function(err,data){
        if(err) throw err;
        console.log(data);
        res.send(data);
    });
});



app.post('/newRequest_id',(req,res)=>{
    var sql = "select request_id from fund_requests order by request_id";
    con.query(sql, function(err,data){
        if (err) throw err;
        res.send(data);
    });
});



app.post('/view_fund_request/:id',(req,res)=>{
    var sql = "select request_id, description, requested_amount, created_on from fund_requests where created_by_id=?";
    var params = [req.params.id];
    con.query(sql,params, function(err,result){
        if(err) throw err;
        res.send(result);
    });
});

//==================================================================================================================================

app.get('/mydonation/:id',(req,res)=>{
    var sql = "SELECT request_id,user_id, SUM(donated_amount) FROM user_donations WHERE user_id=? GROUP BY user_id;";
    var params = [req.params.id]
    con.query(sql,params, function(err,result){
        if(err) throw err;
        res.send(result);
    });
});