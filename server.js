
const express=require('express');
const cors=require('cors');
const path=require('path');

const app=express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname,'public')));

const auth=require('./auth');
const tasks=require('./tasks');

app.use('/api/auth',auth);
app.use('/api/tasks',tasks);

app.get('/',(req,res)=>{
 res.sendFile(path.join(__dirname,'public/index.html'));
});

const PORT=process.env.PORT||3000;
app.listen(PORT,()=>console.log("Server running"));
