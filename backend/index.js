const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const mailer = require('./nodemailer');
const body = require('body-parser');
const maticTransfer = require('./transfer-ERC20');
const maticBalance  = require('./balance-of-ERC20');
const config = require('./config.js')


app.use(body.json());
app.use(body.urlencoded());
app.use(express.static('public'));
mongoose.connect('mongodb+srv://rachit2501:hacktiet@cluster0-djeid.mongodb.net/test?retryWrites=true&w=majority',{useNewUrlParser:true})
    .then(()=>console.log("Connected to databse"))
    .catch(()=>console.log("Failed to connect to database"));

const Schema = mongoose.Schema({
    AadharNumber : Number , 
    PhoneNumber : Number
});

const Schema2 = mongoose.Schema({
    password : String , 
    AadharNumber : Number
})

const model = mongoose.model('UserInfo' , Schema);
const passModel = mongoose.model('passes' , Schema2);

app.post('/register' , async (req , res)=>{
    // const salt = await bcrypt.genSalt(10);
    // const AadharNumber = await bcrypt.hash(req.body.AadharNumber , salt);
    console.log(req.body);
    const user = {
        AadharNumber : req.body.AadharNumber,
        PhoneNumber : req.body.PhoneNumber
    };
    const newUser = new model(user);
    newUser.save();
    res.send("registered");
});

app.post('/verify' , async (req , res)=>{
    const data = model.findOne({AadharNumber : req.body.AadharNumber ,  });
  //  const validPassword = bcrypt.compare(req.body.AadharNumber , )

  if(data)
  {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash("dsofhdasofhjk" , salt);
      const userdetails = new passModel({AadharNumber:req.body.AadharNumber, password:hash});
      mailer(req.body.email , hash);
      res.send("emailSend");
      userdetails.save();
  }
});


app.get('/redirecting/:id*' , async (req , res) =>{
    console.log(req.params.id);
    const user = passModel.findOne({password:req.params.id});
    if(user)
    res.redirect('/paymentGateway');
});

app.get('/paymentGateway' , (req,res)=>{
    console.log("asds");
    res.sendFile(__dirname + '/payment.html');
})
app.get('/' , (req , res)=>{
    res.sendFile(__dirname + '/index1.html');
})

app.get('/form' , (req , res)=>{
    res.sendFile(__dirname + '/form.html');
});
app.get('/about' , (req , res)=>{
    res.sendFile(__dirname + '/about.html');
});

app.get('/mail' , (req , res)=>{
    res.sendFile(__dirname + '/mail.html');
})

app.post('/blockchainTransfer' , (req , res)=>{
    const name = req.body.name;
    var add = ""
    if(name === "bjp")
        add = "0xA09aB1aBeCb91CaC38c3240912D2A1b31e22F147"
    else if(name === "con")
        add = "0x038bCb5eDF4e069BfF32CFCd016ACB4B6d0ccC43"
    else if(name === "sam")        
        add = "0x36dCeE2b84b1E19516025c5384A7c4225AcB5Ce7"
    else if(name === "aap")
        add = "0xA7587b401860b95e0135a3d15b6fc76b9C8E4157"
    if(add)
    maticTransfer( add, req.body.amount);
});

app.post('/blockchainBalance' , (req , res)=>{
    const balance = maticBalance(req.body.address);
    console.log(balance);
});

const port = process.env.PORT || 5003;
app.listen(port , ()=>console.log("server up"));