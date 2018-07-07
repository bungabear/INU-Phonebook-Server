/*
*		201003051 컴퓨터공학부 고종욱 jongwook(koyu1212@naver.com) thanks for Bbulbum
* 	201301459 컴퓨터공학부 손민재 Monjae Son(bungabear6422@gmail.com)
*/
const express = require('express');
const cluster = require('express-cluster');
const session = require('express-session');
const oracledb = require('oracledb');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');
const config = require('./config.js');
const dbConfig = config.dbconfig;
const logDirectory = path.join(__dirname+ '/log');
const contact = require('./routes/contact.js');

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

const accessLogStream = rfs('phonebook.log',{
	interval : '7d',
	size : '10M',
	path : logDirectory
})

morgan.token('ktime',function() {
	now = new Date();
	year = now.getFullYear();
	month = now.getMonth()+1;
	if(month<10){
		month = '0'+month;
	}
	date=now.getDate();
	if(date<10) {
		date = '0'+date;
	}
	hour=now.getHours();
	if(hour<10){
		hour = '0'+hour;
	}
	min = now.getMinutes();
	if(min<10) {
		min = '0'+min;
	}
	sec = now.getSeconds();
	if(sec<10) {
		sec = '0'+sec;
	}
	return year+'-'+month+'-'+date+' '+hour+':'+min+':'+sec;
})

cluster(function(worker) {
	var app = express();
	app.use(morgan(":ktime -" + worker.id+ "호 IP:remote-addr|:method:url 결과:status 응답시간 :response-time ms",{stream:accessLogStream}));
	app.use(morgan(worker.id+"호 IP:remote-addr|:method:url 결과:status 응답시간 :response-time ms"));
	app.use(session({
		key: config.session_key,
		secret: config.session_secret,
		resave: true,
		saveUninitialized: false
	}));

	// 인천대학교 전화번호부
	app.get('/contact', contact.getcontact);
	app.get('/contactgroup', contact.getcontactgroup);
	app.use((err,req,res,next)=>{
		res.sendStatus(500)
		console.error(err)
	})

	app.use((req,res)=>{
		res.send("올바르지 않은 경로로 접속을 시도하였습니다.<br>본 서버는 교내 학사시스템과 연동되어있으며 불법적인 접근 또는 행동으로 간주되는 경우 관계기관에 의뢰됨을 경고합니다.");
	});

	//웹서버시작전 풀 만들어야함
	oracledb.createPool (dbConfig, (err, pool)=>{
		app.listen(config.port, function() {
			console.log('Inu Contact node oracle cluster server ' + worker.id +' 호기 작동' );
		});
	});
},
{count: 2});
