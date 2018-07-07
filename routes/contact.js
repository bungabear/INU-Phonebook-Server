/*
*		201003051 컴퓨터공학부 고종욱 jongwook(koyu1212@naver.com) thanks for Bbulbum
* 	201301459 컴퓨터공학부 손민재 Monjae Son(bungabear6422@gmail.com)
*/
const oracledb = require('oracledb');
const http = require('http');
const fs = require('fs');

oracledb.outFormat = oracledb.OBJECT

var oneMemoize = (func)=>{
  var cached
  var oldKey
  var memoize = function(key){
    if(oldKey != key){
      oldKey = key
      cached = func.apply(this,arguments)
    }
		else{
			console.log('cache hit!')
		}
    return cached
  }
  return memoize;
}

// -------------------- route contact
var getContactMemoiz = oneMemoize(_getcontact)
async function getcontact(req, res, next) {
	// 하루 단위로 memoize cache 변경
	let date = new Date()
	let result = await getContactMemoiz(date.getDay())
	res.header("Content-Type", "application/json; charset=utf-8");
	res.send(result);
	return
}

async function _getcontact(){
	let sql = 'select nm as name, job_div as position, offi_tel_no as phone, dpt_nm as dpart, univ_nm as part from v_campus_tel_no, v_org where v_campus_tel_no.dpt_cd = v_org.dpt_cd'
	let pool = oracledb.getPool();
	try{
		return await dbExecute(pool, sql)
	}
	catch(e){
		console.error(e)
		return null
	}
}

// -------------------- route contactgroup
var getContactGropuMemoiz = oneMemoize(_getcontactgroup)
async function getcontactgroup(req, res, next) {
	// 하루 단위로 memoize cache 변경
	let date = new Date()
	let result = await getContactGropuMemoiz(date.getDay())
	res.header("Content-Type", "application/json; charset=utf-8");
	res.send(result);
	return
}

async function _getcontactgroup(){
	let sql = 'select nm as name, job_div as position, offi_tel_no as phone, dpt_nm as dpart, univ_nm as part from v_campus_tel_no, v_org where v_campus_tel_no.dpt_cd = v_org.dpt_cd'
	let pool = oracledb.getPool();
	try{
		return await dbExecute(pool, sql)
	}
	catch(e){
		console.error(e)
		return null
	}
}

// 단 하나만을 기억하는 memoize
function dbExecute(pool, sql) {
  return new Promise(async function(resolve, reject) {
    let conn;
    try {
      conn = await pool.getConnection();
      let result = await conn.execute(sql);
      resolve(result.rows);
    } catch (err) { // catches errors in getConnection and the query
      reject(err);
    } finally {
      if (conn) {   // the conn assignment worked, must release
        try {
          await conn.release();
        } catch (e) {
          console.error(e);
        }
      }
    }
  });
}

module.exports.getcontact = getcontact;
module.exports.getcontactgroup = getcontactgroup;
