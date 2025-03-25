var express=require("express");
var cloudinary=require("cloudinary").v2;
var mysql2 = require("mysql2");
var fileUploader =require("express-fileupload");
var app=express();
var bodyparser = require('body-parser');
var cookieParser = require("cookie-parser")


//Saving cloudinary information
cloudinary.config({ 
    cloud_name: 'dskm9q08s', 
    api_key: '213668766262337', 
    api_secret: 'ZoScT-y-cjyeswEovIuvAudGJKo' // Click 'View API Keys' above to copy your API secret
});


//server starts
app.listen(2005,function(){
    console.log("Server Started");
})

// Establishing Connection with Database
let dbConfig = "mysql://avnadmin:AVNS_oeO5KeE5srFIkZGbpDm@mysql-practice-fullstack-training.g.aivencloud.com:19960/NextHope";
let mysqlserver=mysql2.createConnection(dbConfig);

mysqlserver.connect(function(err){
    if(err){
        console.log(err.message);
    }
    else{
        console.log("Connection to DB Established.")
    }
})

app.use(express.urlencoded(true)); 
app.use(fileUploader());
app.use(bodyparser.urlencoded({extended: true}));

//used to enable css and styling and creates an all time and anywhere accessable public folder
app.use(express.static("public"));

// enables setting cookie at backend
app.use(cookieParser())


// Function to check if user is logged in and has the correct role
// function checkUserRole(requiredRole) {
//     return function (req, resp, next) {
//         const userEmail = req.cookies.userEmail;
//         const userType = req.cookies.userType;

//         if (!userEmail || !userType) {
//             return resp.send("Access Denied: Please log in.");
//         }

//         if (userType !== requiredRole) {
//             resp.redirect("/unauthorised")
//             // return resp.send("Access Forbidden: You do not have permission.");
            
//         }

//         next(); 
//     };
// }

//index file's URL Handling
app.get("/",function(req,resp){
    let dirName=__dirname;
    let indexfile=dirName+"/pages/index.html";
    resp.sendFile(indexfile);
    })

// Redirected to unauthorised page if no permission found 
// app.get("/unauthorised",function(req,resp){
//     let dirName=__dirname;
//     let indexfile=dirName+"/pages/unauth.html";
//     resp.sendFile(indexfile);
// })


// Save sign up information--> requires duplicacy handling
app.get("/save-signup-information",function(req,resp){
   
    let sgnemail=req.query.sgnemail;
    let sgnpassword=req.query.sgnpassword;
    let usertype=req.query.dropdown1;

    if(!sgnemail || !sgnpassword || sgnemail=="" || sgnpassword=="" || usertype==="Select"){
        resp.send("Fill data properly")
    }
    else{
        mysqlserver.query("select email from UserSignUp where email=?",[sgnemail],function(err,ress){
        if(ress.length===0){
            mysqlserver.query("INSERT INTO UserSignUp(email, pass, usertype) VALUES(?,?,?)",[sgnemail,sgnpassword,usertype],function(err,res2){
                if(!err){
                // console.log("res2"+res2)
                // console.log("a user just signed up. with email: "+sgnemail);
                resp.send("Account created sucessfully! Please login now. DB")}
                else{console.log(err+" while inserting data")}
            })
        }
        else{
            resp.send("Email already exists!")
            // console.log(err)
            
        }})
    }
})

// Perform a real time validation above email box on sign up
app.get("/signup-email-check",function(req,resp){
    let sgnemail=req.query.sgnemail;
    mysqlserver.query("SELECT * from UserSignUp where email=?",[sgnemail],function(err,res){
        
        if(sgnemail==0){
            resp.send("Please enter valid email.")
        }
        else{
            if(res!=0){
                resp.send("Email already exists!")
            }
            else{
                resp.send("New User Detected!")
            }
        }
    })
})

// Login to account -> backend
app.get("/save-login-information",function(req,resp){

     let lgnemail=req.query.lgnemail; //what user inputs in the email login box
     let lgnpassword=req.query.lgnpassword; //what user inputs in the password login box
     mysqlserver.query("SELECT * from UserSignUp where email=?",[lgnemail],function(err,ress1){
        if(ress1!=0){
            mysqlserver.query("SELECT * from UserSignUp where email=?",[lgnemail],function(err,ress){
                // console.log(ress)
                // console.log(ress[0].email)
                if(ress[0].email===lgnemail){
                    mysqlserver.query("SELECT pass,usertype from UserSignUp where email=?",[lgnemail],function(err,resss){
                        // console.log(resss)
                        let userpass = resss[0].pass
                        let typeofuser = resss[0].usertype
                        if(userpass===lgnpassword){
                            // console.log(ress)
                            if(ress[0].status==0){
                                resp.send(typeofuser)
                            }
                            else{
                                resp.send("You're blocked! Contact the admin team.")
                            }
                        }
                        else{
                            resp.send("Incorrect password.")
                        }
                    })
                }
                else{
                    if(lgnemail==0){
                        resp.send("Enter a valid email address.")
                    }
                    else{
                        resp.send("User doesn't exist!")
                    }
                }
            })
        }
        else{
            resp.send("User not present in db")
        }
     })
 
    
})

// volunteer kyc page
app.get("/index",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/index.html"
    resp.sendFile(fullpath)
})

// Fetch Button - fetches all information related to the email and inputs into the fields
app.post("/volkyc-fetch",function(req,resp){
    let userkycEmail = req.body.userkycEmail
    if(!userkycEmail){
        resp.send("Enter Valid Email")
    }
    else{
        mysqlserver.query("select * from volkyc where emailid=? ",[userkycEmail],function(err,res){
            // console.log(res)
            if(res.length===0){
                resp.send("KYC Pending...")
            }
            else{
                if(err){
                    resp.send("Error! while fetching your data!")
                }
                else{
                resp.send(res)}
            }
        })
    }
})
// volunteer dashboard page
app.get("/vol-dash",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/vol-dash.html"
    resp.sendFile(fullpath)
})
// volunteer kyc page
app.get("/vol-kyc",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/vol-kyc.html"
    resp.sendFile(fullpath)
})
// Registering Volunteer KYC
app.post("/volkyc-register", async function (req, resp) {
    let userkycEmail = req.body.userkycEmail;
    let userkycName = req.body.userkycName;
    let userkycContact = req.body.userkycContact;
    let userkycAddress = req.body.userkycAddress;
    let userkycCity = req.body.userkycCity;
    let userkycGender = req.body.userkycGender;
    let userkycDob = req.body.userkycDob;
    let userkycQual = req.body.userkycQual;
    let userkycOccupation = req.body.userkycOccupation;
    let userkycOinfo = req.body.userkycOinfo;
    // let userkycPpic = req.files.userkycPpic;
    // let userkycIDproof = req.files.userkycIDproof;
    // console.log(userkycPpic)
    // console.log(userkycIDproof)
    let fileNamePpic;
    let fileNameID;
    // console.log(userkycEmail)

    mysqlserver.query("select email from UserSignUp  where email=?",[userkycEmail],async function(err,resMain){
        // console.log("resultMain "+JSON.stringify(resMain))
        try{
            console.log(userkycEmail)
            if(!userkycEmail){
                resp.send("Please enter valid email.")
            }
            else{
                if(resMain[0].email==userkycEmail){
                    console.log(err+"1")
                    // resp.send("Email is verified!")
                    if (!userkycEmail || !userkycName || !userkycContact || !userkycAddress || !userkycCity || !userkycDob
                        || userkycOccupation == "Select" || userkycQual == "Select"
                        || userkycGender == "Select") {
                        resp.send("Enter valid details!")
                        console.log(err+"2")
                    }
                    else {
                        console.log(err+"3")
                        if (!req.files) {
                            fileNamePpic = "nopic.jpg";
                            fileNameID = "nopic2.jpg";
                            resp.send("files not uploaded")
                            // console.log(fileNameID + " " + fileNamePpic)
                            console.log(err+"4")
                        }
                        else {console.log(err+"5")
                            {
                                fileNamePpic = req.files.userkycPpic.name;
                                let locationToSavePpic = __dirname + "/public/uploads/" + fileNamePpic;//full ile path
                                req.files.userkycPpic.mv(locationToSavePpic);//saving file in uploads folder
                    
                                //saving ur file/pic on cloudinary server
                                await cloudinary.uploader.upload(locationToSavePpic).then(function (picUrlResultPpic) {
                                    fileNamePpic = picUrlResultPpic.url;   //will give u the url of ur pic on cloudinary server
                                    console.log(fileNamePpic);
                                });
                                fileNameID = req.files.userkycIDproof.name;
                                let locationToSaveID = __dirname + "/public/uploads/" + fileNameID;//full ile path
                                req.files.userkycIDproof.mv(locationToSaveID);//saving file in uploads folder
                                
                                // 2 second delay for the next upload
                                await new Promise(resolve => setTimeout(resolve, 2000)); 
                    
                                //saving ur file/pic on cloudinary server
                                await cloudinary.uploader.upload(locationToSaveID).then(function (picUrlResultIDproof) {
                                    fileNameID = picUrlResultIDproof.url;   //will give u the url of ur pic on cloudinary server
                                    console.log(fileNameID);
                                    console.log(err+"6")
                                });
                                mysqlserver.query("select email,emailid from UserSignUp INNER JOIN volkyc ON UserSignUp.email=volkyc.emailid where volkyc.emailid=?",
                                    [userkycEmail], function (err, res) {
                                        console.log(err+"7")
                                        console.log(res)
                                        if (res.length===0) {
                                            console.log(err+"8")
                                            mysqlserver.query("INSERT INTO volkyc(emailid, fullname, contact, address, city, gender, dob, quali, occu, info, picpath, idpath) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)", [
                                                userkycEmail,
                                                userkycName,
                                                userkycContact,
                                                userkycAddress,
                                                userkycCity,
                                                userkycGender,
                                                userkycDob,
                                                userkycQual,
                                                userkycOccupation,
                                                userkycOinfo,
                                                fileNamePpic,
                                                fileNameID
                                            ], function (err, res2) {
                                                if(!err){
                                                    console.log(err+"9")
                                                resp.send("KYC Completed successfully!")
                                                }
                                                else{console.log(err+"10 main")}
                                            })
                                           
                                        }
                                        else {
                                            
                                            resp.send("Please enter the registered Email address and try again.")
                                            console.log(err+"11")
                                        }
                                    })
                    
                            }
                           
                        }
                
                        
                    }
                }
                else{
                    resp.send("Please enter registered email!")
                    console.log(err+"12")
                }
            }
        }
        catch{
            resp.send("Main Cloud Error!")
            console.error()
        }
        
    })

    
})

// Update Volunteer KYC Details
app.post("/volkyc-update", async function (req, resp) {
    let userkycEmail = req.body.userkycEmail;
    let userkycName = req.body.userkycName;
    let userkycContact = req.body.userkycContact;
    let userkycAddress = req.body.userkycAddress;
    let userkycCity = req.body.userkycCity;
    let userkycGender = req.body.userkycGender;
    let userkycDob = req.body.userkycDob;
    let userkycQual = req.body.userkycQual;
    let userkycOccupation = req.body.userkycOccupation;
    let userkycOinfo = req.body.userkycOinfo;
    let userkycPpic = req.files.userkycPpic;
    let userkycIDproof = req.files.userkycIDproof;
    // console.log(userkycPpic)
    // console.log(userkycIDproof)
    // console.log(userkycPpic)
    // console.log(userkycIDproof)
    // let fileNamePpic;
    // let fileNameID;
// ----------------------------------------------------------
    let NewuserkycEmail;
    let NewuserkycName;
    let NewuserkycContact;
    let NewuserkycAddress;
    let NewuserkycCity;
    let NewuserkycGender;
    let NewuserkycDob;
    let NewuserkycQual;
    let NewuserkycOccupation;
    let NewuserkycOinfo;
    let NewuserkycPpic;
    let NewuserkycIDproof;

    // console.log(userkycEmail)
    mysqlserver.query("select * from volkyc where emailid=?",[userkycEmail],function(err,res3){
        console.log(res3)
        if(res3.length==0){
            resp.send("Fill the required data")
        }
        else{
            NewuserkycEmail = res3[0].emailid;
            NewuserkycName = res3[0].fullname;
            NewuserkycContact = res3[0].contact;
            NewuserkycAddress = res3[0].address;
            NewuserkycCity = res3[0].city;
            NewuserkycGender = res3[0].gender;
            NewuserkycDob = res3[0].dob;
            NewuserkycQual = res3[0].quali;
            NewuserkycOccupation = res3[0].occu;
            NewuserkycOinfo = res3[0].info;
            NewuserkycPpic = res3[0].picpath;
            NewuserkycIDproof = res3[0].idpath;
            // checking if any value is null
            NewuserkycEmail = (userkycEmail != null && userkycEmail !== '') ? userkycEmail : NewuserkycEmail;
            NewuserkycName = (userkycName != null && userkycName !== '') ? userkycName : NewuserkycName;
            NewuserkycContact = (userkycContact != null && userkycContact !== '') ? userkycContact : NewuserkycContact;
            NewuserkycAddress = (userkycAddress != null && userkycAddress !== '') ? userkycAddress : NewuserkycAddress;
            NewuserkycCity = (userkycCity != null && userkycCity !== '') ? userkycCity : NewuserkycCity;
            NewuserkycGender = (userkycGender != null && userkycGender !== '') ? userkycGender : NewuserkycGender;
            NewuserkycDob = (userkycDob != null && userkycDob !== '') ? userkycDob : NewuserkycDob;
            NewuserkycQual = (userkycQual != null && userkycQual !== '') ? userkycQual : NewuserkycQual;
            NewuserkycOccupation = (userkycOccupation != null && userkycOccupation !== '') ? userkycOccupation : NewuserkycOccupation;
            NewuserkycOinfo = (userkycOinfo != null && userkycOinfo !== '') ? userkycOinfo : NewuserkycOinfo;
            NewuserkycPpic = (userkycPpic != null && userkycPpic !== '') ? userkycPpic : NewuserkycPpic;
            NewuserkycIDproof = (userkycIDproof != null && userkycIDproof !== '') ? userkycIDproof : NewuserkycIDproof;
        }
    })

    mysqlserver.query("select email from UserSignUp  where email=?",[userkycEmail],async function(err,resMain){
        // console.log("resultMain "+JSON.stringify(resMain))
        try{
            console.log(userkycEmail)
            if(!userkycEmail){
                resp.send("Please enter valid email.")
            }
            else{
                if(resMain[0].email==userkycEmail){
                    console.log(err+"1")
                    // resp.send("Email is verified!")
                    if (!userkycEmail) {
                        resp.send("Enter valid details!")
                        console.log(err+"2")
                    }
                    else {
                        console.log(err+"3")
                        if (!req.files) {
                            fileNamePpic = "nopic.jpg";
                            fileNameID = "nopic2.jpg";
                            resp.send("files not uploaded")
                            // console.log(fileNameID + " " + fileNamePpic)
                            console.log(err+"4")
                        }
                        else {console.log(err+"5")
                            {
                                NewuserkycPpic = req.files.userkycPpic.name;
                                let locationToSavePpic = __dirname + "/public/uploads/" + NewuserkycPpic;//full ile path
                                req.files.userkycPpic.mv(locationToSavePpic);//saving file in uploads folder
                    
                                //saving ur file/pic on cloudinary server
                                await cloudinary.uploader.upload(locationToSavePpic).then(function (picUrlResultPpic) {
                                    NewuserkycPpic = picUrlResultPpic.url;   //will give u the url of ur pic on cloudinary server
                                    console.log(NewuserkycPpic);
                                });
                                NewuserkycIDproof = req.files.userkycIDproof.name;
                                let locationToSaveID = __dirname + "/public/uploads/" + NewuserkycIDproof;//full ile path
                                req.files.userkycIDproof.mv(locationToSaveID);//saving file in uploads folder
                                
                                // 2 second delay for the next upload
                                await new Promise(resolve => setTimeout(resolve, 2000)); 
                    
                                //saving ur file/pic on cloudinary server
                                await cloudinary.uploader.upload(locationToSaveID).then(function (picUrlResultIDproof) {
                                    NewuserkycIDproof = picUrlResultIDproof.url;   //will give u the url of ur pic on cloudinary server
                                    console.log(NewuserkycIDproof);
                                    console.log(err+"6")
                                });
                                mysqlserver.query("select email,emailid from UserSignUp INNER JOIN volkyc ON UserSignUp.email=volkyc.emailid where volkyc.emailid=?",
                                    [userkycEmail], function (err, res) {
                                        console.log(err+"7")
                                        console.log(res)
                                        if (res.length!=0) {
                                            console.log(err+"8")
                                            mysqlserver.query("UPDATE volkyc set fullname=?, contact=?, address=?, city=?, gender=?, dob=?, quali=?, occu=?, info=?, picpath=?, idpath=? WHERE emailid=?", [
                                                NewuserkycName,
                                                NewuserkycContact,
                                                NewuserkycAddress,
                                                NewuserkycCity,
                                                NewuserkycGender,
                                                NewuserkycDob,
                                                NewuserkycQual,
                                                NewuserkycOccupation,
                                                NewuserkycOinfo,
                                                NewuserkycPpic,
                                                NewuserkycIDproof,
                                                userkycEmail
                                            ], function (err, res2) {
                                                if(!err){
                                                    console.log(err+"9")
                                                resp.send("KYC Updated Completed successfully!")
                                                }
                                                else{console.log(err+"10 main")}
                                            })
                                           
                                        }
                                        else {
                                            
                                            resp.send("Please enter the registered Email address and try again.")
                                            console.log(err+"11")
                                        }
                                    })
                    
                            }
                           
                        }
                
                        
                    }
                }
                else{
                    resp.send("Please enter registered email!")
                    console.log(err+"12")
                }
            }
        }
        catch{
            resp.send("Main Cloud Error!")
            console.error()
        }
        
    })
})

// VOLUNTEER KYC FORM EMAIL VALIDATION ON BLUR - Backend
app.get("/volkyc-email-check",function(req,resp){
    let userkycEmail=req.query.userkycEmail;
    mysqlserver.query("select email from UserSignUp where email=?",[userkycEmail],function(err,res){
        
        if(userkycEmail==0){
            resp.send("Please enter valid email.")
        }
        else{
            if(res.affectedRows!=0){
                resp.send("Email is verified!")
            }
            else{
                resp.send("Please enter registered email!")
            }
        }
    })
})

// Client Register Page
app.get("/client-register-page",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/client-profile.html"
    resp.sendFile(fullpath)
})

// Client Registration via Client Profile
app.post("/client-register", function (req, resp) {
    let clientEmail = req.body.clientEmail;
    let clientName = req.body.clientName;
    let clientBname = req.body.clientBname;
    let clientBizprofile = req.body.clientBizprofile;
    let clientAddress = req.body.clientAddress;
    let clientCity = req.body.clientCity;
    let clientContact = req.body.clientContact;
    let clientIDproof = req.body.clientIDproof;
    let clientIDinfo = req.body.clientIDinfo;
    let clientOinfo = req.body.clientOinfo;

    if (!clientEmail || !clientName || !clientBname || !clientBizprofile || !clientAddress || !clientCity || !clientContact ||
        clientIDproof == "Select" || !clientIDinfo) {
        resp.send("Please fill valid details!")
    }


    else {
        mysqlserver.query("select * from cprofile where email=?", [clientEmail], function (err, res) {
            console.log("1st log -> " + JSON.stringify(res))
            if (!err) {
                // resp.send("length block!")
                if (res.length != 0) {
                    resp.send("Client is already registered!")
                }
                else {
                    mysqlserver.query("insert into cprofile(email, fullname, business, bprofile, address, city, contact, idproof, idnumber, info) VALUES(?,?,?,?,?,?,?,?,?,?)", [
                        clientEmail,
                        clientName,
                        clientBname,
                        clientBizprofile,
                        clientAddress,
                        clientCity,
                        clientContact,
                        clientIDproof,
                        clientIDinfo,
                        clientOinfo
                    ], function (err, res2) {
                        if (res2.affectedRows == 1) {
                            resp.send("Client was successfully registered.")
                        }
                        else {
                            resp.send("Error while registering client." + err)
                        }
                    })
                }
            }
            else {
                console.log(err)
                resp.send("Check Backend for error!")
            }
        })
    }

})

// Checks if email exists in Database CProfile - When user clicks out of email box.
app.post("/clientpfl-id-check",function(req,resp){
    let clientEmail = req.body.clientEmail;

    mysqlserver.query("select * from cprofile where email=?",[clientEmail],function(err,res){
        if(!clientEmail){
            resp.send("Please enter a valid email address.")
        }
        else{
            // console.log("check "+res)
            if(!res.length){
                resp.send("Your email is valid!")
            }
            else{
                resp.send("Your email already exists.")
            }
        }
    })
})

// Client Update Button Request
app.post("/clientpfl-update-request",function(req,resp){
    let clientEmail = req.body.clientEmail;
    let clientName = req.body.clientName;
    let clientBname = req.body.clientBname;
    let clientBizprofile = req.body.clientBizprofile;
    let clientAddress = req.body.clientAddress;
    let clientCity = req.body.clientCity;
    let clientContact = req.body.clientContact;
    let clientIDproof = req.body.clientIDproof;
    let clientIDinfo = req.body.clientIDinfo;
    let clientOinfo = req.body.clientOinfo;

    let updatedEmail;
    let updatedName;
    let updatedBname;
    let updatedBizprofile;
    let updatedAddress;
    let updatedCity;
    let updatedContact;
    let updatedIDproof;
    let updatedIDinfo;
    let updatedOinfo;



    if (!clientEmail || !clientName || !clientBname || !clientBizprofile || !clientAddress || !clientCity || !clientContact ||
        clientIDproof == "Select" || !clientIDinfo) {
        resp.send("Please fill valid details!")
    }
    else{
        mysqlserver.query("select * from cprofile where email=?",[clientEmail],
            function(err,res){
                if (res.length==0){
                    resp.send("Fill the required data."+ err)
                }
                else{
                    updatedEmail=res[0].email;
                    updatedName=res[0].fullname;
                    updatedBname=res[0].business;
                    updatedBizprofile=res[0].bprofile;
                    updatedAddress=res[0].address;
                    updatedCity=res[0].city;
                    updatedContact=res[0].contact;
                    updatedIDproof=res[0].idproof;
                    updatedIDinfo=res[0].idnumber;
                    updatedOinfo=res[0].info;

                    updatedEmail = (clientEmail != null && clientEmail !== '') ? clientEmail : updatedEmail;
                    updatedName = (clientName != null && clientName !== '') ? clientName : updatedName;
                    updatedBname = (clientBname != null && clientBname !== '') ? clientBname : updatedBname;
                    updatedBizprofile = (clientBizprofile != null && clientBizprofile !== '') ? clientBizprofile : updatedBizprofile;
                    updatedAddress = (clientAddress != null && clientAddress !== '') ? clientAddress : updatedAddress;
                    updatedCity = (clientCity != null && clientCity !== '') ? clientCity : updatedCity;
                    updatedContact = (clientContact != null && clientContact !== '') ? clientContact : updatedContact;
                    updatedIDproof = (clientIDproof != null && clientIDproof !== '') ? clientIDproof : updatedIDproof;
                    updatedIDinfo = (clientIDinfo != null && clientIDinfo !== '') ? clientIDinfo : updatedIDinfo;
                    updatedOinfo = (clientOinfo != null && clientOinfo !== '') ? clientOinfo : updatedOinfo;


                    mysqlserver.query("UPDATE cprofile set fullname=?, business=?, bprofile=?, address=?, city=?, contact=?, idproof=?, idnumber=?, info=? where email=?",[updatedName,
                        updatedBname,
                        updatedBizprofile,
                        updatedAddress,
                        updatedCity,
                        updatedContact,
                        updatedIDproof,
                        updatedIDinfo,
                        updatedOinfo,
                        updatedEmail],function(err,res){
                        if (!err){
                            console.log(res)
                            resp.send("Client's data has been updated"+res)
                        }
                        else{
                            resp.send("Error: "+err)
                        }
                    })

                }
            }
        )
    }
})

// Client Email address Fetch Button Request
app.post("/clientpfl-fetch-request",function(req,resp){
    let Email = req.body.clientEmail;
    if (!Email){
        resp.send("Enter a valid email address.")
    }
    else{
        mysqlserver.query("select * from cprofile where email=?",[Email],function(err,res){
            if(!res || res!=0){
                // console.log(res)
                resp.send(res)
            }
            else{
                console.log(err)
            }
        })
    }
})

// Client Dashboard Page
app.get("/client-dashboard-page",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/client-dash.html"
    resp.sendFile(fullpath)
})

// Post a job/recruitment Page
app.get("/client-recruitment-page",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/post-job.html"
    resp.sendFile(fullpath)
})

// Post a job/recruitment API
app.post("/post-job-action",function(req,resp){
    let email = req.body.email
    let jobtitle = req.body.title
    let jobtype = req.body.type
    let address = req.body.address
    let city = req.body.city
    let edu = req.body.edu
    let contact = req.body.contact

    if(!email || !jobtitle || !jobtype || !address || 
        !city || !edu || !contact){
        resp.send("Fill all the Details!")
    }
    else{
        mysqlserver.query("INSERT INTO jobs(cid, jobtitle, jobtype, address, city, edu, contact) VALUES(?,?,?,?,?,?,?)",
            [email,jobtitle,jobtype,address,city,edu,contact],function(err,res){
                if(res.affectedRows==1){
                    // console.log(res)
                    resp.send("Jobs has been posted!")
                }
                else{
                    resp.send("Error posting job: "+err)
                }
            })
    }
    

})

// admin panel page
app.get("/admin-panel-page",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/admin-dash.html"
    resp.sendFile(fullpath)
})

// user access controller page
app.get("/user-access-page",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/user-controller.html"
    resp.sendFile(fullpath)
})

// volunteer manager page
app.get("/vol-manager-page",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/volu-manager.html"
    resp.sendFile(fullpath)
})

// Client Manager Page
app.get("/clients-manager-page",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/clients-manager.html"
    resp.sendFile(fullpath)
})
// Job Management Page
app.get("/cltjob-manager-page",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/job-manager.html"
    resp.sendFile(fullpath)
})
// find work page - volunteer dashboard
app.get("/find-work-page",function(req,resp){
    let dirName = __dirname
    let fullpath = __dirname+"/pages/find-work.html"
    resp.sendFile(fullpath)
})

// Angular --> volunteer manager
app.get("/vol-manage",function(req,resp){
    mysqlserver.query("select * from volkyc",function(err,response){
        if(!err){
            resp.send(response)

        }
        else{
            resp.send(err)
        }
    })
})

// Angular --> clients manager
app.get("/clients-manage",function(req,resp){
    mysqlserver.query("select * from cprofile",function(err,response){
        if(!err){
            resp.send(response)

        }
        else{
            resp.send(err)
        }
    })
})

// Angular Job Manager
app.get("/cltjob-manage",function(req,resp){
    mysqlserver.query("select * from jobs",function(err,response){
        if(!err){
            resp.send(response)

        }
        else{
            resp.send(err)
        }
    })
})
//Angular Find Work
app.get("/find-work-bck",function(req,resp){
    // console.log(req.session)
    // console.log(req.headers.cookie)
    mysqlserver.query("select * from jobs",function(err,res){
        // if(req.session?.activeUser=="Volunteer" ||req.session?.activeUser=="Admin"){
        //     resp.send(res)
        // }
        // else{
        //     resp.send("Wrong User!")
        // }
        // console.log(req.headers)
        resp.send(res)
        // console.log(res)
    })
})

//------------access all cities of client post---angular find work
app.get("/all-records-client-city", function (req, resp) {
    mysqlserver.query("select distinct city from jobs ", function (err, result) {
        resp.send(result);
    })
})
//-----------access all job titles of client post---angular find work
app.get("/all-records-client-title", function (req, resp) {
    mysqlserver.query("select distinct jobtitle from jobs ", function (err, result) {
        resp.send(result);
    })
})

app.get("/all-filtered-city",function(req,resp){
    mysqlserver.query("select * from jobs where city=?",[req.query.filtercity],function(err,res){
        if(!err){
        console.log(err+"error")
        console.log(res+"result")
        resp.send(res)}
        else{
            console.log(err)
        }

    })
})
