
const express=require('express');
const router=express.Router();
const db=require('./db');
const jwt=require('jsonwebtoken');

const SECRET="secret123";

function auth(req,res,next){
 const token=req.headers.authorization;
 if(!token) return res.json({error:"No token"});
 try{
  req.user=jwt.verify(token,SECRET);
  next();
 }catch{
  res.json({error:"Invalid token"});
 }
}

router.get('/',auth,(req,res)=>{
 db.all("SELECT * FROM tasks WHERE user_id=?",[req.user.id],(e,r)=>res.json(r));
});

router.post('/',auth,(req,res)=>{
 const {title,subject,priority,date}=req.body;
 db.run("INSERT INTO tasks (user_id,title,subject,priority,date) VALUES (?,?,?,?,?)",
 [req.user.id,title,subject,priority,date],
 function(){res.json({id:this.lastID})});
});

router.delete('/:id',auth,(req,res)=>{
 db.run("DELETE FROM tasks WHERE id=? AND user_id=?",
 [req.params.id,req.user.id],
 function(){res.json({deleted:this.changes})});
});

module.exports=router;
