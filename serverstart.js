const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");

require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({extended:true}));

let url = `https://v2.jokeapi.dev/joke/`;


app.use(express.static(`public`))
app.use('/css', express.static(`${__dirname}public/css`))
app.use('/js', express.static(`${__dirname}public/js`))
app.use('/img',express.static(`${__dirname}public/img`))

app.set('views', './views')
app.set('view engine','ejs')


app.get("/fail",(req, res)=>{
    res.render('failure');
})

app.get("/success",(req,res)=>{
    res.render('success');
})

app.post("/fail",(req,res)=>{
    res.redirect('/')
})
app.post("/sign",(req,res)=>{
    res.redirect('/')
})
app.post("/joke",(req,res)=>{
    res.render('signup')
})

app.get("",function(req, res){
    https.get(url +"Any", (response)=>{
        response.on("data",(data)=>{
            let joke = JSON.parse(data);
            console.log(joke);
            renderPage(res, joke);
        })
    })
});

app.post("",(req,res)=>{
    newurl = inputHandler(req);
    https.get(newurl, (response)=>{
        response.on("data",(data)=>{
            let joke = JSON.parse(data);
            console.log(joke);
            renderPage(res, joke);
        })
    })
})

app.get("/signup",(req,res)=>{
    res.render('signup');
})
app.post("/signup",(req,res)=>{
    signupHandler(req,res);
})

app.listen(process.env.PORT || 3001, function(){
    console.log("Port:3001 or Heroku\nServer is live.");
});



//Newsletter Handler 
function signupHandler(req,res){
    const fName = req.body.fname;
    const lName = req.body.lname;
    const email = req.body.email;
     
    const data = {
        members:[
            {
                email_address: email,
                status: "subscribed",
                merge_fields:{
                    FNAME: fName,
                    LNAME: lName
                }
            }
        ]
    };
    const jsonData = JSON.stringify(data);
    const mailUrl = `https://us6.api.mailchimp.com/3.0/lists/${process.env.listId}`
    const options = {
        method: "POST",
        auth: `H8rs:${process.env.mailChimp}`
    }

   const request = https.request(mailUrl, options, (response)=>{
        if(response.statusCode === 200){
            res.render('success')
        }else{
            res.render('failure')
        }
    
        response.on("data", (data)=>{
            console.log(JSON.parse(data));
        })
    })
    request.write(jsonData);
    request.end();
}


//Main page Handle functions
function jokeHandler(j){
    let type = j.type;
    if(type == 'twopart'){
        let setup = j.setup;
        let delivery = j.delivery;
        return (`${setup} ${delivery}`);
    }else{
        let joke = j.joke;
        return (joke);
    }
}
function inputHandler(req){
    url = `https://v2.jokeapi.dev/joke/`;
    let pgm = req.body.pgm; let misc = req.body.misc; let dark = req.body.dark; let pun = req.body.pun; let spooky = req.body.spooky;let christmas = req.body.christmas;
    let nsfw = req.body.nsfw; let rel = req.body.rel; let pol = req.body.pol; let race = req.body.race; let sex = req.body.sex; let exp = req.body.exp;
    let bl = false;

    if(pgm){url = url + "Programming,"}
    if(misc){url = url + "Miscellaneous,"}
    if(dark){url = url + "Dark,"}
    if(pun){url = url + "Pun,"}
    if(spooky){url = url + "Spooky,"}
    if(christmas){url = url + "Christmas,"}

    if(url == "https://v2.jokeapi.dev/joke/"){url = url + "Any"}else{
        url = url.slice(0,-1);
    }
    url = url +"?blacklistFlags=";
    if(nsfw){url = url + "nsfw,"; bl = true;}
    if(rel){url = url + "religious,"; bl = true;}
    if(pol){url = url + "political,"; bl = true;}
    if(race){url = url + "racist,"; bl = true;}
    if(sex){url = url + "sexist,"; bl = true;}
    if(exp){url = url + "explicit,"; bl = true;}
    if(bl){
        url = url.slice(0,-1);
    }else{
        url = url.slice(0,-16);
    }
    console.log(url);
    return url;
}
function renderPage(res, joke){
    res.render('home', {html1: jokeHandler(joke)});
}

