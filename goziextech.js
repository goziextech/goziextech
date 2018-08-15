    var express = require('express');
    var goziextech = express ();
    var port = process.env.PORT || 3000;
    var bodyParser = require('body-parser');
    //var mongo = require('mongodb');
    var mongoose = require ('mongoose');
    var path = require('path');
    var cookieParser = require('cookie-parser');
    var exphbs = require('express-handlebars');
    var expressValidator = require('express-validator');
    var flash = require('connect-flash');
    var session = require('express-session');
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var nodemailer = require('nodemailer');
    var helmet = require('helmet');
    var nocache = require('nocache');
    //var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    //View Engine
    /*goziextech.set('views',path.join (__dirname, 'views'));
    goziextech.engine('handlebars', exphbs({defaultLayout:'layout'}));
    goziextech.set('view engine', 'handlebars');*/

  //Req.header is different from Res.header
    goziextech.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      //res.header("X-Frame-Options", "DENY");    
      next();
    });

    //Securities
    goziextech.use(helmet());
    goziextech.disable('x-powered-by');
    //goziextech.use(nocache())

    //BodyParser Middleware
    goziextech.use(bodyParser.json());
    goziextech.use(bodyParser.urlencoded({extended: true}));
    goziextech.use(cookieParser());

    //Express Session
    goziextech.use (session({
        secret: 'secret',
        saveUninitialized: true,
        resave:true

    }));
    
    /*   
    goziextech.use(session({
      name: 'session',
      keys: ['key1', 'key2'],
      cookie: {
        secure: true,
        httpOnly: true,
        domain: 'example.com',
        path: 'foo/bar',
        expires: expiryDate
      }
    }))*/ 

    //Passport init
    goziextech.use(passport.initialize());
    goziextech.use(passport.session());


    //Express Validator
    goziextech.use(expressValidator({
    errorFormarter: function (param, msg, value){
     var namespace = param.split('.')
     ,root = namespace.shift()
     ,formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param:formParam,
            msg: msg,
            value: value
        };  

            }    
    }));

    // Connect Flash
    goziextech.use(flash());

    // Global Vars
    goziextech.use(function(req, res, next){
    res.locals.success_msg = req.flash ('success_msg');
    res.locals.error_msg = req.flash ('error_msg');
    res.locals.error = req.flash ('error');  
    next();    
    });


    //goziextech.use(express.static(path.join(__dirname +'studentdashboard')));
    //goziextech.use(express.static(__dirname +'/studyinbudapest'));
    goziextech.use(express.static(__dirname +'/universityapp'));
    //goziextech.use(express.static(__dirname +'/plugins'));


    Students = require('./models/studentsmodel.js'); //connect students collection
    Universities = require('./models/universitymodel.js');//connect universities collection

    universitymaillist = require('./models/universitymailer.js');//connect universities mailer collection

    //Connect to Mongoose
    //mongoose.connect('mongodb://localhost/students');
    //var db = mongoose.connection;


    // Connect to Mongo DB
    var promise = mongoose.connect('mongodb://localhost:/Studyinbudapestusers', {
    useMongoClient: true,
      /* other options */
    });
    promise.then(function(db) {

    db.model('Students');  //Student model  
    db.model('Universities'); // Universities Model
    db.model('universitymaillist'); // Universities Mailer Model
        
    });

    //Passport
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });
    
    //Serialize Passport
    passport.deserializeUser(function(id, done) {
      Universities.getUniversitiesById(id, function(err, user) {
        done(err, user);
      });
    });

    //Passport Strategy
    passport.use(new LocalStrategy(
      function(username,password, done) {   
       Universities.getUniversityByUsername(username,password, function(err, user) {
            
          if (err) return console.log(err);
          if (!user) {
            return done(null, false, { message: 'Incorrect username.' });
          }   
          return done(null,user);
       
           /* if (!user.validPassword(password)) {
            return done(null, false, { message: 'Incorrect password.' });
          }
          Students.comparePassword(password, Students.password, function(err,isMatch))
           if (err) return console.log(err);
          if (isMatch) {
           return done(null,user);
          } else {
              return done(null, false, { message: 'Incorrect password.' }
          }

           return done(null, user);*/   
        });
      }));


      // Reusable Nodemailer Transporter
        let transporter = nodemailer.createTransport({
            host: 'mail.studyinbudapest.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: 'admissions@studyinbudapest.com', // user
                pass: '@dmissions1988' // password
            },
            tls: {
            rejectUnauthorized: false
        }

        }); 

    //Login and Authenticate University
    //create a security function for request that can"t get h and w variables and use only get host
    goziextech.post('/', 
      passport.authenticate('local',{ failureRedirect: '#/login/error',failureFlash:true }),
      //Username and Password comes from req               
      function (req, res, next) { 
        //If successfull
        res.redirect('#/university/account/' + req.user.id);
        //res.json(user);
      });

    function ensureAuthenticated(req, res, next) {
     if (req.isAuthenticated()){
         //req.user.isAuthenticated();
        return next(); 
     }  else { 
       /* res.json({
         status: "You are unathourized";   
        });*/
        res.redirect('/');
     }  

    }

  function ensurePostPutDeleteIsAuthorized(req, res, next) { 
    var fullrequesturl = req.protocol + '://' + req.get('host') + req.originalUrl;
    var requesturl = req.get('host');  
    var siteurl = "recruitment.studyinbudapest.com"; //127.0.0.1
    var codeprinthtmlheight = req.body.cp;
    var codeprinthtmlwidth = req.body.w;
    var goziextechCustomKey = "/validated@GoziexTech1988";
    var validKeyCombination = goziextechCustomKey + codeprinthtmlheight + codeprinthtmlwidth ;
    var ValidatedKeyforRequest = "/validated@GoziexTech198825320";
    var websiteSecurityCheckIsPassed = requesturl == siteurl;
    var validCalcutationCheckIsPassed = codeprinthtmlheight + codeprinthtmlwidth;  
    var validKeyCheckIsPassed = validCalcutationCheckIsPassed > 100;  
      
    if (websiteSecurityCheckIsPassed && validKeyCheckIsPassed){
    //console.log("All checks passed");
    return next();           
    } else {
         res.json({
         status: "You are unathourized"   
        });
        
        console.log(fullrequesturl);
        console.log(req.body);
        console.log("This request is a spoof, did not pass Goziex Tech authorized origin test");
        console.log(requesturl);
        console.log(siteurl);
        console.log(validCalcutationCheckIsPassed);  
        console.log(codeprinthtmlheight);
        console.log(codeprinthtmlwidth);
        console.log(goziextechCustomKey);
        console.log(validKeyCombination);
        console.log(ValidatedKeyforRequest); 
        return false;
    }

    }


    //Logout Universities
    goziextech.get('/logout', function (req, res, next) { 
        req.logout();
        res.redirect('/');
        //res.json(user);
      });/**/


/*
    //API Home
    goziextech.get('/',function(req, res, next){
    res.send('You are not authorized to view this page'); 
    });
*/



    goziextech.post('/authentication', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){ 
        
    /*if (err){
        res.send('Database or passport error please check');
        return console.log(err)
        } */      
    res.send(req.user);
    });
 
    //Get for Student Applicants
    //ensureAuthenticated,

/*    goziextech.get('/students', function(req, res, next){    
     //res.send('Welcome to Students API area');    
       Students.getStudents (function(err, students){
       if (err){ return console.log(err);
                res.send('Database error please check'); 
        }   
         res.json(students);
        });    

    });*/

  goziextech.post('/allstudents',ensurePostPutDeleteIsAuthorized, function(req, res, next){        
       Students.getStudents (function(err, students){
       if (err){ return console.log(err);
                res.send('Database error please check'); 
        }   
         res.json(students);
        });    

    });


    //Post student details
    //ensureAuthenticated,
    goziextech.post('/students', ensurePostPutDeleteIsAuthorized, function(req, res, next){
        var student = req.body;
        var stdntfnmae = student.first_name;    
        var stdntlname = student.last_name;
        var stdnteml = student.email;
        var stdntcountry = student.country; 
        var uvrstynm = student.university;
        var course = student.course;
        var sibdashboardsite = "http://recruitment.studyinbudapest.com"; 
        var studyinbudapestemail = "admissions@studyinbudapest.com"; 
        var uvrstynm = req.body.university;
        var course = req.body.course;
        var baseurl = "http://app.studyinbudapest.com/";
        var applicationportal = "http://www.studyinbudapest.com/search-universities";
        var universityemail= "admissions@studyinbudapest.com";
        var sibdashboardsite = "http://recruitment.studyinbudapest.com";
        
        if (uvrstynm == "Mcdaniels College"){
         var applicationportal = baseurl + "apply-to-mcdaniel.html";
         var universityemail = "admissions@mcdaniel.hu";    
            
        } else if (uvrstynm == "Budapest Metropolitan University") {
         var applicationportal = baseurl + "apply-to-metropolitan.html";
         var universityemail = "international@metropolitan.hu";    
           
        } else if (uvrstynm == "Eotvos Lorand University") {
         var applicationportal = baseurl + "apply-to-elte.html";
         var universityemail = "iso@btk.elte.hu";     
                
        } else if (uvrstynm == "International Business School") {
         var applicationportal = baseurl + "apply-to-ibs.html";
         var universityemail = "info@ibs-b.hu";    
            
        } else if (uvrstynm == "Budapest Arts & Design University") {
         var applicationportal = baseurl + "apply-to-mome.html";
         var universityemail = "nemeth@mome.hu";   
            
        } else if (uvrstynm == "Semmelweis Medical University") {
         var applicationportal = baseurl + "apply-to-semmelweis.html";
         var universityemail = "english.secretariat@semmelweis-univ.hu";
            
        } else if (uvrstynm == "Budapest University of Science") {
         var applicationportal = baseurl + "apply-to-bme.html";
          var universityemail = "admission@kth.bme.hu";
            
        } else if (uvrstynm == "Corvinus University") {
         var applicationportal = baseurl + "apply-to-corvinus.html";
         var universityemail = "intoffice@uni-corvinus.hu";   
            
        } else if (uvrstynm == "Budapest Business School") {
         var applicationportal = baseurl + "apply-to-bgf.html";   
         var universityemail = "admission@kth.bme.hu";
            
        } else if (uvrstynm == "Central European University") {
         var applicationportal = baseurl + "apply-to-ceu.html";
         var universityemail = "communications_office@ceu.edu"; 
            
        } else {
          var applicationportal = applicationportal;
          var universityemail = universityemail;    
        } //End url check  
        
       

        Students.addStudent (student, function(err, student){
        if (err){ return console.log(err);
        }      
           res.json(student);
        });   
        
        //SIB notify mail
        let NotifySibMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: studyinbudapestemail, // list of receivers
            subject: stdntfnmae +' '+ stdntlname +  ' Applied to ' + uvrstynm ,
            text: 'Application Recieved', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ stdntfnmae +'</b><p> Started an application to study <b>'+ course +'</b> at <b>'+ uvrstynm +'</b> you can check the status of the university website here </p><center><a href="'+ applicationportal +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> University Website </a></center><p>If you will like to ask a question from the student, you can send a message to '+ stdnteml +' or if you need assistance from the university to answer any student question, you can contact the university using the the email address: '+ universityemail +'</p><center><a href="mailto:'+ stdnteml +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #32CD32; border-radius: 60px; text-decoration:none;"> Message </a></center><p>Study in Budapest connects you with universities and makes it easy for you to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app.</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };
        
         transporter.sendMail(NotifySibMail, (error, info) => {
           if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });   
        
        //Note if email is not sending maybe a university has turned it off
        
        //Get All Universities and notify them
       universitymaillist.getUniversitiesMailInfo (function(err, universitiesmailinfo){
       if (err){ return console.log(err); 
        } else if (universitiesmailinfo){
        
        for(var i = 0; i < universitiesmailinfo.length; i++)
        {
       console.log("emails:" + universitiesmailinfo[i].email);
       var eachuniversityemail = universitiesmailinfo[i].email; 
       var eachuniversityname = universitiesmailinfo[i].university;
       var eachuniversityid = universitiesmailinfo[i]._id;        
       //University notify mail
        let UniversitiesNotifyMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: eachuniversityemail, // list of receivers
            subject:'New Application Recieved - Recruit Now',
            text: 'Application Recieved', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="www.studyinbudapest.com" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>Hi '+ eachuniversityname +',</b><p><b>'+ stdntfnmae +' '+ stdntlname +'</b> from <b>'+ stdntcountry +'</b> has just started an application to study <b>'+ course +'</b> at <b>'+ uvrstynm +'</b> if you offer <b>'+ course +'</b> at <b>'+ eachuniversityname +'</b> then this is a great oppurtunity to hurry up and be the first to recruit this student for free </p><center><a href="'+ sibdashboardsite +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;">Recruit Student</a></center><p>If you will like to ask a question from<b> '+ stdntfnmae +' '+ stdntlname +'</b>, you can also send a message to<b> '+ stdntfnmae +' '+ stdntlname +'</b></p><center><a href="'+ sibdashboardsite +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #32CD32; border-radius: 60px; text-decoration:none;">Send Message </a></center><p>Other universities in your region use Studyinbudapest Mobile App and they can see <b>'+ stdntfnmae +' '+ stdntlname +'</b> application</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="http://recruitment.studyinbudapest.com/#/email/unsubscribe/'+ eachuniversityemail +'/'+ eachuniversityid +'" style="color: #b2b2b5; text-decoration:underline;">Turn off Notifications</a> </p></div></div></div></body>'
        };
            
        transporter.sendMail(UniversitiesNotifyMail, (error, info) => {
           if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });     
       } //End For Loop       
            
        }  
           
        });  
        

    });



    /*//Get Student by ID
    goziextech.get('/students/:_id', ensureAuthenticated, function(req, res, next){

         //res.send('Welcome to Students API area');  
        //Declared in line 80
        Students.getStudentsById (req.params._id,function(err, student){
        if (err){ return console.log(err);
        }   
           res.json(student);
        //res.render('studentdashboard/index.html')    
        });    

    });*/

    //Get Student by ID
    goziextech.post('/profile/students/:_id', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){

         //res.send('Welcome to Students API area');  
        //Declared in line 80
        Students.getStudentsById (req.params._id,function(err, student){
        if (err){ return console.log(err);
        }   
           res.json(student);
        //res.render('studentdashboard/index.html')    
        });    

    });

   
    //Get Student by ID // Duplicated to change get to post to be able to ensure authenticate and ensure post put deleted is secured
    goziextech.post('/student/:_id', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){

        Students.getStudentsById (req.params._id,function(err, student){
        if (err){ return console.log(err);
        }   
           res.json(student);   
        });    

    });


    //Get Universities
    goziextech.post('/admin/universities', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){ 
       Universities.getUniversities (function(err, universities){
       if (err){ return console.log(err);
                res.json({
                "Info": "could not get universities due to server error"
                }); 
        }   
         res.json(universities);
        });    

    });

 //Get Universities
    goziextech.post('/alluniversities',ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){ 
       Universities.getUniversities (function(err, universities){
       if (err){ return console.log(err);
             
        }   
         res.json(universities);
        });    

    });


    //getUniversityByEmail and Check for Existing User
    goziextech.post('/u/c', ensurePostPutDeleteIsAuthorized,function(req, res, next){
    var username = req.body.username;
    var email = req.body.email;
    /*console.log(username);
    console.log(email); */   
        Universities.getUniversityByEmail (email, function(err, university){ //callback
        if (err){ return console.log(err);
        } // Replace with if(university) // then res.json userfound
        if (!university) {
            res.json({
            status:"usernotfound"
            });  
        } else {  
            res.json(university);
        }  


        });    
    });

   //getStudentByEmail and Check for Existing User
    goziextech.post('/s/c', ensurePostPutDeleteIsAuthorized, function(req, res, next){
    var email = req.body.email;    
        Students.getStudentsByEmail (email, function(err, student){ 
        if (err){ return console.log (err);
        } 
        if (!student) {
            res.json({
            status:"usernotfound"
            });  
        } else {  
            res.json(student);
        }  


        });    

    });

  //CheckStatusByEmail
    goziextech.post('/c/s',ensurePostPutDeleteIsAuthorized,function(req, res, next){
        var email = req.body.email;    
        Students.CheckStatusByEmail (email, function(err, student){ 
        if (err){ return console.log (err);
        } 
        if (!student) {
            res.json({
            status:"usernotfound"
            });  
        } else {  
            res.json(student)
        }  
        });    
      });


    //Edit Number of Applied Students
    goziextech.put('/edit/universities/applied/:_id',ensurePostPutDeleteIsAuthorized, ensureAuthenticated,function(req, res, next){
    var universityid = req.params._id;
    var universitydetails = req.body;
    var numberofappliedstudents = req.body.number_of_students; 
        
    Universities.updateNumberOfStudents(universityid, numberofappliedstudents, {}, function(err, updateduniversity){
    if (err){ return console.log(err);} 
    
    if(updateduniversity){
    console.log("Updated number of applied students successsfully");    
    }    
   
    }); //End Update   
     
    }); //End Edit   
        

     //Resend Verification Email
      goziextech.post('/resend/verifymail', ensurePostPutDeleteIsAuthorized, ensureAuthenticated,function(req, res, next){
      var university = req.body;              
      let verifyMailOptions = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: university.universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ university.universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        }; 
          
        res.sendStatus(200);    
          
        transporter.sendMail(verifyMailOptions, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  console.log("Verifiy your email address email sent to new email address");
                  res.sendStatus(200);
            }
            
        }); 
       }); //End Edit 




    //Create University
    goziextech.post('/universities', ensurePostPutDeleteIsAuthorized, function(req, res, next){
    var university = req.body;   
    Universities.addUniversity (university, function(err, createduniversity){
        
        if (err){   
            return res.json({
            status:"Goziex Tech Info: Internal goziextech error or incorrect validation"    
            });
            console.log(err);
                   
        } else if (createduniversity){
            
        //res.json(createduniversity); /Info:can't send res twice, reason for this being commented out, since res, is sending 200OK for email    
         //SIB notify mail
        let uniRegNotifyMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: "admissions@studyinbudapest.com", // list of receivers
            subject: createduniversity.university +' has just registered on the app!',
            text: 'Application Recieved', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>Hi Goziex Tech</b><p><center>Here are the steps to check the authencity of the university, you can view the </p></center><center><a href="'+ createduniversity.application_portal +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> University Website </a></center><br><center><p>You call the university using the number provided at registration , you can call ' + createduniversity.phone + '</p></center><center><a href="tel:'+ createduniversity.phone +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Call University </a></center><center><p>If you will like to verify the university</p></center><center><a href="http://recruitment.studyinbudapest.com/#/activate/' + createduniversity.email + '" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #32CD32; border-radius: 60px; text-decoration:none;"> Activate Account </a></center><p>Study in Budapest connects international students with universities and makes it easy for students to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app.</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        }; 
            
         transporter.sendMail(uniRegNotifyMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });    
            
        } 
     });   
        
     //Add to Mailing list DB   
        universitymaillist.addUniversityMailInfo (university, function(err, createduniversity){
         //Add to mailer   
        if (err){   
            return console.log(err);
                   
        } else if (createduniversity){
          res.sendStatus(200); //OK  
        }      
          });
        /*
        if (createduniversity) {   
         res.json(createduniversity);    
         // Set 30 Days trial period    
         setTimeout(function(){
         //When Json is sent res ends
         Universities.deactivateTrial (createduniversity, function(err, deactivateduniversity){
          if (err){ return console.log(err);
         }     
           //res.json(deactivateduniversity); //Send back trial deactivation 
           console.log(deactivateduniversity) 
         })

         }, 600000);    


        } // end else 
       */
    });    


     
    //Edit University Profile
    goziextech.put('/edit/universities/:_id', ensurePostPutDeleteIsAuthorized, ensureAuthenticated,function(req, res, next){
    var id = req.params._id;
    var universitydetails = req.body;
    //console.log(universitydetails);    
    var universityfirstname = universitydetails.first_name;
    var universitylastname =  universitydetails.last_name;  
    var universityemail = universitydetails.email;
    var applicationportal = universitydetails.application_portal;    
    var password = universitydetails.password;
    var phonenumber = universitydetails.phone;
    var oldemail = universitydetails.oldemail;
    //console.log(universitydetails); 
    var subscriptiondetails = {
  first_name: universitydetails.unidata.first_name,
  last_name: universitydetails.unidata.last_name,
  email: universityemail,
  username: universityemail,
  password: universitydetails.unidata.password,
  university: universitydetails.unidata.university,
  country: universitydetails.unidata.country,
  city: universitydetails.unidata.city,
  state: universitydetails.unidata.state,
  phone: universitydetails.unidata.phone,
  pd: universitydetails.unidata.pd,
  trial: universitydetails.unidata.trial,
  device: universitydetails.unidata.device,
  about: universitydetails.unidata.about,
  session: universitydetails.unidata.session,
  activation: universitydetails.unidata.activation,
  date_of_activity: universitydetails.unidata.date_of_activity,
  verification_status: universitydetails.unidata.verification_status,
  notification: universitydetails.unidata.notification,
  image_url: universitydetails.unidata.image_url,
  university_website: universitydetails.unidata.university_website,
  application_portal: universitydetails.unidata.application_portal,
  processed_students: universitydetails.unidata.processed_students,
  rejected_students: universitydetails.unidata.rejected_students,
  admission_offers: universitydetails.unidata.admission_offers,
  courses: universitydetails.unidata.courses,
  msg_txt: universitydetails.unidata.msg_txt };
        
        //First name
        if (universityfirstname){
        //Update First Name    
          Universities.EditUniversityFirstName (id, universityfirstname, {}, function(err, university){ 
        if (err){ return console.log(err); 
        } 
        
        let securityMail = { 
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>FIRST NAME</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        
        res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });
              
        });
            
        }
        
        
        
        //IF Last Name
         if (universitylastname){
        //Update Last Name    
          Universities.EditUniversityLastName (id, universitylastname, {}, function(err, university){
          
        if (err){ return console.log(err); 
        } 
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>LAST NAME</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        
        res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
           
        });
              
        });
            
        }
         
        //IF Email    
        if (universityemail){
        //Update Email
        Universities.EditUniversityEmail (id, universityemail, {}, function(err, university){   
        if (err){ return console.log(err);
        } 
         
        //unverify    
        Universities.unVerifyUniversityEmail (id, {}, function(err, unverifieduniversity){
        if (err){ return console.log(err);
        } 
            
        });
            
            
        //Subscribe to notification    
        if (subscriptiondetails){      
         universitymaillist.readdUniversityMailInfo(subscriptiondetails, function(err, addeduniversity){
          if (err){
           return console.log(err); 
          }   
         });  
        }    
        
        //Unsubscribe to Notifications    
         if (oldemail){ 
         var oldemailaddress = oldemail;    
           universitymaillist.unsubscribeUniversityOnEmailChange(oldemailaddress, function(err, deletedsubscrtiption){
            if (err){return console.log(err);}   
            /*if (deletedsubscrtiption){
            console.log("Subscription Deleted"); 
             } else if (!deletedsubscrtiption){
               console.log("Subscription was already not existing");  
             }    */
           }); 
         }    
            
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>EMAIL</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        
          let verifyMailOptions = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;">Verification Status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
             
        res.sendStatus(200);
           
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            console.log("Security mail sent to old address");
        }); 
            

        // send mail with defined transport object
        transporter.sendMail(verifyMailOptions, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            console.log("Verifiy your email address email sent to new email address");
        });     
                
            
        });  //End edit function 
            
       
        } //End IF for Email Edit
       
        
         //Application Portal
        if (applicationportal){
               
        //Update Application Portal    
          Universities.EditUniversityApplicationPortal (id, applicationportal, {}, function(err, university){
        //console.log(university);    
        if (err){ return console.log(err);
        } 
        
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>APPLICATION PORTAL</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        
        let verifyMailOptions = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: university.email, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' application portal' , 
            text: 'Verify your application portal', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify the change to your application portal to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ university.email +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy Portal</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
             
        res.sendStatus(200);
        
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });
              
         transporter.sendMail(verifyMailOptions, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });       

        });
            
        }
        
        //IF Password
        if (password){
        //Update Password
        Universities.EditUniversityPassword  (id, password, {}, function(err, university){
        //console.log(university);    
        if (err){ return console.log(err);
        } 
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>PASSWORD</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });     
           
        });  
        }
        
        //IF Phone Number
        if (phonenumber){
        //Update Phone Number
        Universities.EditUniversityPhone  (id, phonenumber, {}, function(err, university){
          
        if (err){ return console.log(err);
        } 
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>PHONE NUMBER</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });     
           
        });  
        }
        
      

    });

    goziextech.put('/edit/universities/2/:_id', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){
     
    var id = req.params._id;
    var universitydetails = req.body; //pass every data from body 
    var universityfirstname = universitydetails.first_name;
    var universitylastname =  universitydetails.last_name;  
    var universityemail = universitydetails.email;
    var password = universitydetails.password;
    var phonenumber = universitydetails.phone;
    var applicationportal = universitydetails.application_portal;
    var oldemail = universitydetails.oldemail;
    //console.log(universitydetails); 
    var subscriptiondetails = {
      first_name: universitydetails.unidata.first_name,
      last_name: universitydetails.unidata.last_name,
      email: universityemail,
      username: universityemail,
      password: universitydetails.unidata.password,
      university: universitydetails.unidata.university,
      country: universitydetails.unidata.country,
      city: universitydetails.unidata.city,
      state: universitydetails.unidata.state,
      phone: universitydetails.unidata.phone,
      pd: universitydetails.unidata.pd,
      trial: universitydetails.unidata.trial,
      device: universitydetails.unidata.device,
      about: universitydetails.unidata.about,
      session: universitydetails.unidata.session,
      activation: universitydetails.unidata.activation,
      date_of_activity: universitydetails.unidata.date_of_activity,
      verification_status: universitydetails.unidata.verification_status,
      notification: universitydetails.unidata.notification,
      image_url: universitydetails.unidata.image_url,
      university_website: universitydetails.unidata.university_website,
      application_portal: universitydetails.unidata.application_portal,
      processed_students: universitydetails.unidata.processed_students,
      rejected_students: universitydetails.unidata.rejected_students,
      admission_offers: universitydetails.unidata.admission_offers,
      courses: universitydetails.unidata.courses,
      msg_txt: universitydetails.unidata.msg_txt };    
        
        //1. If Email and Phone
        if ((universityemail) && (phonenumber)){
        //Update Email and Phone
        Universities.EditUniversityEmailPhone (id, universityemail, phonenumber, {}, function(err, university){    
        if (err){ return console.log(err);
        } 
        
        //unverify    
        Universities.unVerifyUniversityEmail (id, {}, function(err, unverifieduniversity){
        if (err){ return console.log(err);
        }     
        });
                
        //Subscribe to notification    
        if (subscriptiondetails){      
         universitymaillist.readdUniversityMailInfo(subscriptiondetails, function(err, addeduniversity){  
         if (err){ return console.log(err);}
         });  
        }    
        
        //Unsubscribe to Notifications
         if (oldemail){ 
         var oldemailaddress = oldemail;    
           universitymaillist.unsubscribeUniversityOnEmailChange(oldemailaddress, function(err, deletedsubscrtiption){
            if (err){ return console.log(err);}
           }); 
         }     
            
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>EMAIL AND PHONE NUMBER</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        
          let verifyMailtoNewEmailAddress = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
        
       res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
            
         transporter.sendMail(verifyMailtoNewEmailAddress, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });         
            
        });
            
        }
        
        //2. Email and Password
        if (universityemail && password){
        //Update Email Password
        Universities.EditUniversityEmailPassword  (id, password,universityemail, {}, function(err, university){
        //console.log(university);    
        if (err){ return console.log(err);
        }
        
        //unverify    
        Universities.unVerifyUniversityEmail (id, {}, function(err, unverifieduniversity){
        if (err){ return console.log(err);
        }   
        });
                
        //Subscribe to notification    
        if (subscriptiondetails){      
         universitymaillist.readdUniversityMailInfo(subscriptiondetails, function(err, addeduniversity){  
         if (err){ return console.log(err);}
         });  
        }    
        
        //Unsubscribe to Notifications
         if (oldemail){ 
         var oldemailaddress = oldemail;    
           universitymaillist.unsubscribeUniversityOnEmailChange(oldemailaddress, function(err, deletedsubscrtiption){
            if (err){ return console.log(err);}
           }); 
         }     
                
            
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>EMAIL AND PASSWORD</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        let verifyMailtoNewEmailAddress = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
        
       res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
            
         transporter.sendMail(verifyMailtoNewEmailAddress, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });         

        });  
        }
        
        //3. Email and First name
        if (universityemail && universityfirstname){
        //Update Email First name
        Universities.EditUniversityFirstNameEmail  (id, universityfirstname,universityemail, {}, function(err, university){
           
        if (err){ return console.log(err);
        }
        
        //unverify    
        Universities.unVerifyUniversityEmail (id, {}, function(err, unverifieduniversity){
        if (err){ return console.log(err);
        }    
        });
                
        //Subscribe to notification    
        if (subscriptiondetails){      
         universitymaillist.readdUniversityMailInfo(subscriptiondetails, function(err, addeduniversity){  
         if (err){ return console.log(err);}
         });  
        }    
        
        //Unsubscribe to Notifications
         if (oldemail){ 
         var oldemailaddress = oldemail;    
           universitymaillist.unsubscribeUniversityOnEmailChange(oldemailaddress, function(err, deletedsubscrtiption){
            if (err){ return console.log(err);}
           }); 
         }         
            
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>EMAIL AND FIRST NAME</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        
        let verifyMailtoNewEmailAddress = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
        
       res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
            
         transporter.sendMail(verifyMailtoNewEmailAddress, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });         
            
            
        });  
        }
        
        //4.Password and Phone
        if (password && phonenumber){
        //Update Password Phone
        Universities.EditUniversityPasswordPhone  (id, password, phonenumber, {}, function(err, university){
           
        if (err){ return console.log(err);
        } 
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>PASSWORD AND PHONE</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            console.log('Message sent: %s', info.messageId);
            console.log(securityMail);
        });     
           res.json(university);
        });  
        }
        
        //5. First Name and Password
        if (universityfirstname && password){
        //Update First Name Password
        Universities.EditUniversityFullnamePassword  (id, universityfirstname, password, {}, function(err, university){   
        if (err){ return console.log(err);
        } 
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>FIRST NAME AND PASSWORD</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            
        });     
        });  
        }
        
        //6. First Name and Phone Number
         if (universityfirstname && phonenumber){
        //Update First Name Phone Number
        Universities.EditUniversityPhoneFullname  (id, universityfirstname, phonenumber, {}, function(err, university){
           
        if (err){ return console.log(err);
        }
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>FIRST NAME AND PHONE NUMBER</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            
        });     
           
        });  
        }
        
        
        //7. Last Name and First Name
        if (universityfirstname && universitylastname){
        //Update Last Name Full Name
        Universities.EditUniversityLastNameFullName  (id, universityfirstname,  universitylastname, {}, function(err, university){
           
        if (err){ return console.log(err);
        }
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>LAST NAME AND FIRST NAME</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
           
        });     
           
        });  
        }
        
        //8. Last Name and Password
        if (universitylastname && password){
        //Update Last Name Password
        Universities.EditUniversityLastNamePassword  (id, universitylastname, password, {}, function(err, university){
            
        if (err){ return console.log(err);
        }
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>LAST NAME AND PASSWORD</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
           
        });     
           
        });  
        }
        
        //9. Last Name and Email
        if (universitylastname && universityemail){
        //Update Last Name Email
        Universities.EditUniversityLastNameEmail  (id, universitylastname, universityemail, {}, function(err, university){
        //console.log(university);    
        if (err){ return console.log(err);
        }
            
        //unverify    
        Universities.unVerifyUniversityEmail (id, {}, function(err, unverifieduniversity){
        if (err){ return console.log(err);
        }     
        });
                
        //Subscribe to notification    
        if (subscriptiondetails){      
         universitymaillist.readdUniversityMailInfo(subscriptiondetails, function(err, addeduniversity){  
         if (err){ return console.log(err);}
         });  
        }    
        
        //Unsubscribe to Notifications
         if (oldemail){ 
         var oldemailaddress = oldemail;    
           universitymaillist.unsubscribeUniversityOnEmailChange(oldemailaddress, function(err, deletedsubscrtiption){
            if (err){ return console.log(err);}
           }); 
         }         
            
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>LAST NAME AND EMAIL</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>' 

         } 
        
       let verifyMailtoNewEmailAddress = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
        
       res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
            
         transporter.sendMail(verifyMailtoNewEmailAddress, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });         
        });  
        }
        
        //10. Last Name and Phone Number
        if (universitylastname && phonenumber){
        //Update Last Name Phone Number
        Universities.EditUniversityLastNamePhoneNumber  (id, universitylastname, phonenumber, {}, function(err, university){
            
        if (err){ return console.log(err);
        }
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>LAST NAME AND PHONE NUMBER</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }     
        });     
           
        });  
        }
      
         //11. University FirstName and Application Portal 
        if (universityfirstname && applicationportal){
        //Update University FirstName and Application Portal 
        Universities.EditFirstNameApplicationPortal  (id, universityfirstname, applicationportal, {}, function(err, university){   
        if (err){ return console.log(err);
        }
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>FIRST NAME AND APPLICATION PORTAL</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
           
        });     
        });  
        }
        
        //12. University Last Name and Application Portal 
        if (universitylastname && applicationportal){
        //Update University FirstName and Application Portal 
        Universities.EditLastNameApplicationPortal  (id, universitylastname, applicationportal, {}, function(err, university){
            
        if (err){ return console.log(err);
        }
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>LAST NAME AND APPLICATION PORTAL</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }     
        });     
        });  
        }
        
        //13. University Email Application Portal  
        if (universityemail && applicationportal){
        //University Email Application Portal  
        Universities.EditEmailApplicationPortal  (id, universityemail, applicationportal, {}, function(err, university){   
        if (err){ return console.log(err);
        }
            
        //unverify    
        Universities.unVerifyUniversityEmail (id, {}, function(err, unverifieduniversity){
        if (err){ return console.log(err);
        }    
        });
                
        //Subscribe to notification    
        if (subscriptiondetails){      
         universitymaillist.readdUniversityMailInfo(subscriptiondetails, function(err, addeduniversity){  
         if (err){ return console.log(err);}
         });  
        }    
        
        //Unsubscribe to Notifications
         if (oldemail){ 
         var oldemailaddress = oldemail;    
           universitymaillist.unsubscribeUniversityOnEmailChange(oldemailaddress, function(err, deletedsubscrtiption){
            if (err){ return console.log(err);}
           }); 
         }         
            
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>EMAIL AND APPLICATION PORTAL</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        
       let verifyMailtoNewEmailAddress = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
        
       res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
            
         transporter.sendMail(verifyMailtoNewEmailAddress, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });         
        });  
        }
        
        //14. University Password Application Portal  
        if (password && applicationportal){
        // Update University Password Application Portal 
        Universities.EditPasswordApplicationPortal  (id, password, applicationportal, {}, function(err, university){   
        if (err){ return console.log(err);
        }
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>PASSWORD AND APPLICATION PORTAL</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            
        });
        });  
        }
        
        //13. University Phone Application Portal  
        if (phonenumber && applicationportal){
            
        Universities.EditPhoneApplicationPortal(id, phonenumber, applicationportal, {}, function(err, university){   
        if (err){ return console.log(err);
        }
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>PHONE AND APPLICATION PORTAL</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });     
        }); 
            
            
        }   
    });

    goziextech.put('/universities/edit/all/:_id', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){
    var id = req.params._id;    
    var universitydetails = req.body;
    var universityfirstname = universitydetails.first_name;
    var universitylastname =  universitydetails.last_name;  
    var universityemail = universitydetails.email;
    var password = universitydetails.password;
    var phonenumber = universitydetails.phone;
    var applicationportal = universitydetails.application_portal;
    var oldemail = universitydetails.oldemail;
    //console.log(universitydetails); 
    var subscriptiondetails = {
      first_name: universitydetails.unidata.first_name,
      last_name: universitydetails.unidata.last_name,
      email: universityemail,
      username: universityemail,
      password: universitydetails.unidata.password,
      university: universitydetails.unidata.university,
      country: universitydetails.unidata.country,
      city: universitydetails.unidata.city,
      state: universitydetails.unidata.state,
      phone: universitydetails.unidata.phone,
      pd: universitydetails.unidata.pd,
      trial: universitydetails.unidata.trial,
      device: universitydetails.unidata.device,
      about: universitydetails.unidata.about,
      session: universitydetails.unidata.session,
      activation: universitydetails.unidata.activation,
      date_of_activity: universitydetails.unidata.date_of_activity,
      verification_status: universitydetails.unidata.verification_status,
      notification: universitydetails.unidata.notification,
      image_url: universitydetails.unidata.image_url,
      university_website: universitydetails.unidata.university_website,
      application_portal: universitydetails.unidata.application_portal,
      processed_students: universitydetails.unidata.processed_students,
      rejected_students: universitydetails.unidata.rejected_students,
      admission_offers: universitydetails.unidata.admission_offers,
      courses: universitydetails.unidata.courses,
      msg_txt: universitydetails.unidata.msg_txt };      
        
         //11. First Name, Last Name,Email and Password
        if ((universityfirstname) && (universitylastname) && (universityemail) && (password) && (!phonenumber) && (!applicationportal)){
       
        Universities.EditFirstNameLastNameEmailPassword (id,universityfirstname, universitylastname, universityemail, password, {}, function(err, university){   
        if (err){ return console.log(err);
        }
        
        //unverify    
        Universities.unVerifyUniversityEmail (id, {}, function(err, unverifieduniversity){
        if (err){ return console.log(err);
        }    
        });
                
        //Subscribe to notification    
        if (subscriptiondetails){      
         universitymaillist.readdUniversityMailInfo(subscriptiondetails, function(err, addeduniversity){  
         if (err){ return console.log(err);}
         });  
        }    
        
        //Unsubscribe to Notifications
         if (oldemail){ 
         var oldemailaddress = oldemail;    
           universitymaillist.unsubscribeUniversityOnEmailChange(oldemailaddress, function(err, deletedsubscrtiption){
            if (err){ return console.log(err);}
           }); 
         }         
            
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>account information</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        
      let verifyMailtoNewEmailAddress = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
        
       res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
            
         transporter.sendMail(verifyMailtoNewEmailAddress, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });            
            
        });  
        }     
        
        
     //12. First Name, Last Name,Email
        if ((universityfirstname) && (universitylastname) && (universityemail) && (!password) && (!phonenumber) && (!applicationportal)){
        //Update First Name, Last Name,Email
        Universities.EditFirstNameLastNameEmail (id,universityfirstname, universitylastname, universityemail, {}, function(err, university){   
        if (err){ return console.log(err);
        }
                 
        //unverify    
        Universities.unVerifyUniversityEmail (id, {}, function(err, unverifieduniversity){
        if (err){ return console.log(err);
        }     
        });
                
        //Subscribe to notification    
        if (subscriptiondetails){      
         universitymaillist.readdUniversityMailInfo(subscriptiondetails, function(err, addeduniversity){  
         if (err){ return console.log(err);}
         });  
        }    
        
        //Unsubscribe to Notifications
         if (oldemail){ 
         var oldemailaddress = oldemail;    
           universitymaillist.unsubscribeUniversityOnEmailChange(oldemailaddress, function(err, deletedsubscrtiption){
            if (err){ return console.log(err);}
           }); 
         }         
            
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>account information</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        
       let verifyMailtoNewEmailAddress = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
        
       res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
            
         transporter.sendMail(verifyMailtoNewEmailAddress, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });          
            
        });  
        }     
        
        //13. First Name, Last Name,Email, Password, Phone Number and Application Portal
        if (universityfirstname && universitylastname && universityemail && password && phonenumber && applicationportal){
       
        Universities.EditAllUniversityDetail (id,universityfirstname, universitylastname, universityemail, password, phonenumber, applicationportal, {}, function(err, university){   
        if (err){ return console.log(err);
        }
        
        //unverify    
        Universities.unVerifyUniversityEmail (id, {}, function(err, unverifieduniversity){
        if (err){ return console.log(err);
        }     
        });
                
        //Subscribe to notification    
        if (subscriptiondetails){      
         universitymaillist.readdUniversityMailInfo(subscriptiondetails, function(err, addeduniversity){  
         if (err){ return console.log(err);}
         });  
        }    
        
        //Unsubscribe to Notifications
         if (oldemail){ 
         var oldemailaddress = oldemail;    
           universitymaillist.unsubscribeUniversityOnEmailChange(oldemailaddress, function(err, deletedsubscrtiption){
            if (err){ return console.log(err);}
           }); 
         }         
            
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>account information</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        
        let verifyMailtoNewEmailAddress = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
        
       res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
            
         transporter.sendMail(verifyMailtoNewEmailAddress, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });           
            
        });  
        }
        
        //13. First Name, Last Name,Email and Application Portal
        if ((universityfirstname) && (universitylastname) && (universityemail) && (!password) && (!phonenumber) && (applicationportal)){
        //Update First Name, Last Name,Email and Application Portal
        Universities.EditFirstNameLastNameEmailApplicationPortal (id,universityfirstname, universitylastname, universityemail, applicationportal, {}, function(err, university){   
        if (err){ return console.log(err);
        }
        
        //unverify    
        Universities.unVerifyUniversityEmail (id, {}, function(err, unverifieduniversity){
        if (err){ return console.log(err);
        }   
        });
                
        //Subscribe to notification    
        if (subscriptiondetails){      
         universitymaillist.readdUniversityMailInfo(subscriptiondetails, function(err, addeduniversity){  
         if (err){ return console.log(err);}
         });  
        }    
        
        //Unsubscribe to Notifications
         if (oldemail){ 
         var oldemailaddress = oldemail;    
           universitymaillist.unsubscribeUniversityOnEmailChange(oldemailaddress, function(err, deletedsubscrtiption){
            if (err){ return console.log(err);}
           }); 
         }         
            
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b>First Name, Last Name,Email and Application Portal</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        
      let verifyMailtoNewEmailAddress = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
        
       res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
            
         transporter.sendMail(verifyMailtoNewEmailAddress, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });           
            
        });  
        } 
        
        
        
        
        //13. Last Name,Email and Application Portal
        if ((!universityfirstname) && (universitylastname) && (universityemail) && (!password) && (!phonenumber) && (applicationportal)){
        //Update Last Name,Email and Application Portal
        Universities.EditLastNameEmailApplicationPortal (id, universitylastname, universityemail, applicationportal, {}, function(err, university){   
        if (err){ return console.log(err);
        }
        
        //unverify    
        Universities.unVerifyUniversityEmail (id, {}, function(err, unverifieduniversity){
        if (err){ return console.log(err);
        }   
        });
                
        //Subscribe to notification    
        if (subscriptiondetails){      
         universitymaillist.readdUniversityMailInfo(subscriptiondetails, function(err, addeduniversity){  
         if (err){ return console.log(err);}
         });  
        }    
        
        //Unsubscribe to Notifications
         if (oldemail){ 
         var oldemailaddress = oldemail;    
           universitymaillist.unsubscribeUniversityOnEmailChange(oldemailaddress, function(err, deletedsubscrtiption){
            if (err){ return console.log(err);}
           }); 
         }         
            
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b> Last Name,Email and Application Portal</b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        
        let verifyMailtoNewEmailAddress = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: university.first_name + ' please verify your '+ university.university +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };
        
       res.sendStatus(200);
        
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
            
         transporter.sendMail(verifyMailtoNewEmailAddress, (error, info) => {
            if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });           
            
        });  
        } 
        
        //14. Application Portal, Password and Phone
        if ((!universityfirstname) && (!universitylastname) && (!universityemail) && (password) && (phonenumber) && (applicationportal)){
        //Update Application Portal, Password and Phone
        Universities.EditApplicationPortalPasswordPhone (id, applicationportal, password, phonenumber, {}, function(err, university){   
        if (err){ return console.log(err);
        }
        let securityMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Security: Your account information has been changed!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ university.first_name +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just changed your <b> Application Portal, Password and Phone </b>, if you did not initiate this request or change please  do not ignore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>' 

         } 
        res.sendStatus(200);
        transporter.sendMail(securityMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
           
        });  //End Transporter   
            
        });  
        }    
        
    });

       //A dump , deletable 
       /*if ((!universityfirstname) && (!universityemail) && (!password) && (!phonenumber)){
            res.send('No data entered by user', 400);  
        }*/


    //Deactivate Trial
    goziextech.post('/deactivatetrial',ensurePostPutDeleteIsAuthorized, ensureAuthenticated,function(req, res, next){
        var id = req.body.id;
         Universities.deactivateTrialPeriod (id, function(err, deactivateduniversity){
          if (err){ return console.log(err);
         } 
        if (deactivateduniversity){
        res.json(deactivateduniversity)    
        }     
          });

        });

    //Deactivate Subscription
    goziextech.post('/deactivatesubscription', ensurePostPutDeleteIsAuthorized, ensureAuthenticated,function(req, res, next){
        var id = req.body.id;
         Universities.resetSubscription (id, function(err, deactivateduniversity){
          if (err){ return console.log (err);
         } 
        if (deactivateduniversity){
        res.json(deactivateduniversity)    
        } else {
          res.sendStatus(401); //Not found 
        }    
          });

        });

     //Add Authorization Key
    //Email Activation
    goziextech.post('/verify/:email',ensurePostPutDeleteIsAuthorized, function(req, res, next){
    var email = req.params.email; 

        Universities.getUniversityByEmail (email, function(err, university){
        if (err){ return console.log(err);
        }  
          if (!university) {
            res.json({
            status:"usernotfound"
            });  
        } else if (university) {  

        Universities.verifyUniversityEmail(university, function(err,university){
         //console.log(university);    
         res.json(university)     
        });

        } // end else 
        });    

    });

//Add Authorization Key
    //Email Activation
    goziextech.post('/activate/:email',ensurePostPutDeleteIsAuthorized, function(req, res, next){
    var email = req.params.email; 

        Universities.getUniversityByEmail (email, function(err, university){
        if (err){ return console.log(err);
        }  
          if (!university) {
            res.json({
            status:"usernotfound"
            });  
        } else if (university) {  

        Universities.activateAccount( university, function(err,university){
         res.json(university)     
        });

        } // end else 
        });    

    });


//Add Authorization Key
    //Email Activation
    goziextech.post('/deactivate/:_id',ensurePostPutDeleteIsAuthorized, function(req, res, next){
    var id = req.params._id;     
     
     Universities.deactivateAccount(id, function(err,university){
         if (err){
         return console.log(err);
       } else if (university){
           
         
         
         let uniReactivateEmail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: "admissions@studyinbudapest.com", // list of receivers
            subject: university.university +' has been deactivated!',
            text: 'Application Recieved', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>Hi Goziex Tech</b><p><center>'+ university.university +' has recently been deactivated manually by an administrator of Goziex Technologies Limited</p></center><center><p>If you will like to reactivate the university</p></center><center><a href="http://recruitment.studyinbudapest.com/#/activate/' + university.email + '" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #32CD32; border-radius: 60px; text-decoration:none;"> Reactivate Account </a></center><p>Study in Budapest connects international students with universities and makes it easy for students to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app.</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        }; 
        
        let verifyMailOptions = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: university.universityemail, // list of receivers
            subject: university.first_name + ' your '+ university.university +' has been deactivated' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p> Your account has recently been deactivated, this could be due to security reasons, please verify your email address to activate your account, if after versification, your account is still in active please contact support</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ university.universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ university.university+' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        }; 
          
        res.sendStatus(200);    
          
        transporter.sendMail(verifyMailOptions, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  console.log("Verifiy your email address email sent to new email address");
                  res.sendStatus(200);
            }
            
        });    
            
         transporter.sendMail(uniReactivateEmail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
          }); 
              }
       });
       });


     //Unsubscribe university email
    goziextech.post('/university/unsubscribe/:email/:_id', ensurePostPutDeleteIsAuthorized, function(req, res, next){
    var email = req.params.email;
    var uid = req.params._id; 
        
        
           //Turn notififcation column of university   
        Universities.turnOffNotifications(uid, function(err,turnedoffuniversity){
        if (err){ return console.log(err);
        } else if(turnedoffuniversity)     
        console.log("Turned notification field off");     
        });

        universitymaillist.getUniversityMailInfoByEmail (email, function(err, university){
        if (err){ return console.log (err);
        } else if (!university) {
            
            res.json({
            status:"Email could not be found"
            });  
            
        } else if (university) { 
            
        let turnOffNotifyMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Info: Your notifications has been turned off!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;"> Hi '+ university.university +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-badge-study-in-budapest-mobile-app.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just turned off your <b>email notitifications</b>, you will no longer be able to recieve email notifications of students applying to other universities in your area<br><center><a href="http://recruitment.studyinbudapest.com/" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Turn it on </a></center></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited<br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a> </p></div></div></div></body>' 

         } 
        
        transporter.sendMail(turnOffNotifyMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });  //End Transporter   
             
        //Delete from mailist    
        universitymaillist.unsubscribeUniversity(university, function(err,university){
        console.log("deleted from mailist");    
         res.json(university)
        });   

        } // end else 
        });    

    });

     //Unsubscribe university email
    goziextech.post('/university/subscribe', ensurePostPutDeleteIsAuthorized, function(req, res, next){
    var university = req.body;
    var universityid = req.body._id;    
        
     universitymaillist.addUniversityMailInfo(university, function(err,university){
         if (err){ return console.log(err);
        }
         res.json(university)
         let turnOnNotifyMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: university.email, // reciever
            subject: 'Account Info: Your notifications has been turned on!' ,
            text: 'Account Security: Your account information has been changed!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;"> Hi '+ university.university +',</h1><p style="margin-top:0px; color:#bbbbbb;"></p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Your <b>email notitifications settings</b> has been switched on, you will now be able to recieve email notifications of students applying to other universities in your area <br><center><a href="http://recruitment.studyinbudapest.com/#/email/unsubscribe/'+ university.email +'/'+ university._id +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Turn it off </a></center></p><center>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you need help, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited<br><a href="http://recruitment.studyinbudapest.com/#/email/unsubscribe/'+ university.email +'/'+ university._id +'" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a> </p></div></div></div></body>' 

         } 
        
        transporter.sendMail(turnOnNotifyMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });  //End Transporter 
        });
        
        Universities.turnOnNotifications(universityid, function(err,turnedoffuniversity){
        if (err){ return console.log(err);
        }    
         //res.json(turnedoffuniversity);     
        });
    
    });
     
     
    //P Reset
    goziextech.post('/reset', ensurePostPutDeleteIsAuthorized, function(req, res, next){
    var email = req.body.useremail; 

        Universities.getUniversityByEmail (email, function(err, university){
        if (err){ return console.log(err);
        }  
          if (!university) {
            res.json({
            status:"usernotfound"
            });  
        } else if (university) {  

        //Universities.resetUniversityp( university, function(err,university){
         res.json(university)
         var password = university.password;
         var email = university.email;
         var firstname = university.first_name.toUpperCase();

         let resetMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com',
            to: email, // list of receivers
            subject: firstname +' here is your password reset instructions' ,
            text: 'Password Reset Instructions', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="border-bottom:1px solid #f6f6f6;"><h1 style="font-size:14px; font-family:arial; margin:0px; font-weight:bold;">'+ firstname +',</h1><center><img src="http://www.studyinbudapest.com/images/emailassets/security-icon-300x300-blue-study-in-budapest.png" style="display:block; width:10%"></center><p style="margin-top:0px; color:#bbbbbb;">Here are your password reset instructions.</p></td></tr><tr><td style="padding:10px 0 30px 0;"><p>Someone has just requested the password to your account, if you did not initiate this request or change please igonore this email and kindly <a href="http://help.studyinbudapest.com"> contact support</a></p><center><b>PASSWORD:'+ password +'</b></center><b>- Thanks Studyinbudapest</b></td></tr><tr><td  style="border-top:1px solid #f6f6f6; padding-top:20px; color:#777">If you continue to have problems, please feel free to contact us at support@studyinbudapest.com</td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited<br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a> </p></div></div></div></body>' 

         }
       // });

        transporter.sendMail(resetMail, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            
        }); 



        } // end else 
        });    

    });


    //Delete university details
    goziextech.delete('/universities/:_id', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){    
       var id = req.params._id;
        
    //Delete from mailist    
        universitymaillist.unsubscribeUniversitybyId(id, function(err,university){
         console.log("Deleted from mailing list");    
        });
           
    //res.send('Welcome to Students API area');
        Universities.deleteUniversity (id, function(err, university){
        if (err){ return console.log(err);
        } 
        console.log("University Info deleted");   
        res.json(university);    
        }); 
        

    });


  /*  //Get University by ID
    goziextech.get('/universities/:_id', ensureAuthenticated,function(req, res, next){
        Universities.getUniversitiesById (req.params._id,function(err, university){
        if (err){ return console.log(err);
        }   
           res.json(university);
        //res.render('studentdashboard/index.html')    
        });    

    });*/

  //Get University by ID
    goziextech.post('/profile/universities/:_id',ensurePostPutDeleteIsAuthorized,ensureAuthenticated,function(req, res, next){
        Universities.getUniversitiesById (req.params._id,function(err, university){
        if (err){ return console.log(err);
        }   
           res.json(university);
        //res.render('studentdashboard/index.html')    
        });    

    });

//Get Recruited Student by ID
 goziextech.post('/recruited/universities/:_id',ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){
        Universities.getRecruitedStudentById (req.params._id,function(err, university){
        if (err){ return console.log(err);
        }   
           res.json(university);
        //res.render('studentdashboard/index.html')    
        });    

    });


    //Update university student details
    goziextech.put('/universities/:_id', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){
    var id = req.params._id;
    var student = req.body; 
        Universities.UpdateRecruitedStudents (id, student, {}, function(err, student){   
        if (err){ return console.log(err);
        }   
           res.json(student);
        });    
    });


    //Add Processed Student
    goziextech.put('/universities/proccessed/:_id', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){
    var id = req.params._id;
    var student = req.body; 
        Universities.AddProcessedStudents (id, student, {}, function(err, student){    
        if (err){ return console.log(err);
        }   
           res.json(student);
        });    

    });


    //Update university plan
    goziextech.put('/universities/plan/:_id',ensurePostPutDeleteIsAuthorized, ensureAuthenticated,function(req, res, next){

    var id = req.params._id;
    var plan = req.body.plan;
    var dateofsubscription = req.body.sub;    
    //console.log(plan)    
       Universities.updateUniversityPlan (id, plan, dateofsubscription, {}, function(err, university){
        //console.log(university);    
       if (err){ return console.log (err);
        }   
          res.json(university);
       });   

    });


    //Update student details
    goziextech.put('/students/:_id',ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){

    var id = req.params._id;    
    var student = req.body;   
    //res.send('Welcome to Students API area');  

        Students.updateStudent (id, student, {}, function(err, student){
        if (err){ return console.log(err);
        }   
           res.json(student);
        });    

    });

    
    //Handle Recruit Messages
    goziextech.post('/recruit', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){

        //Declare Variables
        var stdntfnmae = req.body.first_name;
        var lastname = req.body.last_name;
        var stdnteml = req.body.email;
        var std = req.body.student_id;
        var universityname = req.body.university;
        var country = req.body.country;
        var phone = req.body.phone;
        var course = req.body.course;
        var applicationstatus = req.body.application_status;
        var academicqualification = req.body.academic_qualification;
        var language = req.body.language_proficiency;
        var travel = req.body.travel_visa;
        var accountstatus = req.body.accountstatus;
        var onlineportal = req.body.onlineportal;
        var date = req.body.date;
        
        //var admsnofcr = req.body.admsnofcr; 
        //console.log(accountstatus);
        //console.log(onlineportal);
        
        if (accountstatus == "free"){
            
        let mailOptions = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: ' Congratulations! ' + stdntfnmae + ' you recieved an application offer from ' + universityname +' ',
            text: 'You recieved an application offer', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="http://www.studyinbudapest.com" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><center><div style="background:#grey; padding:20px; color:black;"> <div style="background-color:red; color:white; width:25px; height:25px; border-radius:20px; display:inline-block; margin-right:5px;"><center>1</center></div> Offer for '+ stdntfnmae +' '+ lastname +' </div> </center><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ stdntfnmae +'</b><p>Whats going on in <b>' + country + ' ? </b>'+ universityname +' will like to offer you an oppurtunity to apply to their university, to accept this application offer click</p><center><a href="http://www.studyinbudapest.com/download-api" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Apply now </a></center><p>You can read more about this university on your Studyinbudapest mobile app. Study in Budapest makes it easy for you to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app</p><b>- Thanks Studyinbudapest<br><center><a href="http://www.studyinbudapest.com/download-api"><img src="http://www.studyinbudapest.com/images/emailassets/applegoole.png" alt="Studyinbudapest" style="border:none; display:block; width:60%"></a></center></b> </td></tr></tbody></table></div><center><div style="margin-top:20px"><a href="https://www.facebook.com/studyingbudapest"><img src="http://recruitment.studyinbudapest.com/plugins/images/Facebook-Icon-Circle-Outline-Grey.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="tel:+12019921664"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_phone_281830.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%; "></a><a href="https://www.instagram.com/studyinbudapst"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_instagram_281827.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="https://twitter.com/studyinbudapst"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_twitter_281833.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="https://www.youtube.com/channel/UCxVJxK_vB8Oi5fqUFU8-I4g?view_as=subscriber"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_youtube_281826.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a></div></center><div style="text-align: center; font-size: 12px; color: #b2b2b5; line-height: normal;"><p> Powered by Goziex Technologies Limited <p>This email was intended for '+ stdntfnmae +' '+ lastname +' ('+ course +' at '+universityname +'). <a href="http://help.studyinbudapest.com">Learn why you are recieving this message </a> </p><p> © Study in Budapest, Study in Europe, is a registered business of Goziex Technologies LLC Company.</p><br>Already admitted? <a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };
            
         // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            //console.log('Message sent: %s', info.messageId);
            //console.log(mailOptions);
        });     
    
            
        } else {
            //If not free
            
        let mailOptions = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: ' Congratulations! ' + stdntfnmae + ' you recieved an application offer from ' + universityname +' ',
            text: 'you recieved an application offer', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="http://www.studyinbudapest.com" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><center><div style="background:#grey; padding:20px; color:black;"> <div style="background-color:red; color:white; width:25px; height:25px; border-radius:20px; display:inline-block; margin-right:5px;"><center>1</center></div> Offer for '+ stdntfnmae +' '+ lastname +' </div> </center><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ stdntfnmae +'</b><p>Whats going on in <b>' + country + ' ? </b>'+ universityname +' will like to offer you an oppurtunity to apply to their university, to accept this application offer visit</p><center><a href="'+ onlineportal +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> University Website </a></center><p>You can read more about this university on your Studyinbudapest mobile app. Study in Budapest makes it easy for you to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app</p><b>- Thanks Studyinbudapest<br><center><a href="http://www.studyinbudapest.com/download-api"><img src="http://www.studyinbudapest.com/images/emailassets/applegoole.png" alt="Studyinbudapest" style="border:none; display:block; width:40%"></a></center></b> </td></tr></tbody></table></div><center><div style="margin-top:20px"><a href="https://www.facebook.com/studyingbudapest"><img src="http://recruitment.studyinbudapest.com/plugins/images/Facebook-Icon-Circle-Outline-Grey.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="tel:+12019921664"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_phone_281830.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%; "></a><a href="https://www.instagram.com/studyinbudapst"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_instagram_281827.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="https://twitter.com/studyinbudapst"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_twitter_281833.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="https://www.youtube.com/channel/UCxVJxK_vB8Oi5fqUFU8-I4g?view_as=subscriber"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_youtube_281826.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a></div></center><div style="text-align: center; font-size: 12px; color: #b2b2b5; line-height: normal;"><p> Powered by Goziex Technologies Limited <p>This email was intended for '+ stdntfnmae +' '+ lastname +' ('+ course +' at '+universityname +'). <a href="http://help.studyinbudapest.com">Learn why you are recieving this message </a> </p><p> © Study in Budapest, Study in Europe, is a registered business of Goziex Technologies LLC Company.</p><br>Already admitted? <a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };    
         res.sendStatus(200);   
         // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            //console.log('Message sent: %s', info.messageId);
            //console.log(mailOptions);
        });     
       
            
            
        }
        
        
       
    });

    //Delete recruited student
    goziextech.delete('/recruit/delete/:_id', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){

    var id = req.params._id;    
    var studentid = req.body.id; 

        Universities.deleteUniversityRecruitedstudent (id, studentid, {}, function(err, deletedstudent){
        if (err){ return console.log (err);
        }   
           res.json(deletedstudent);
        });    

    });



   //Delete student details
    goziextech.delete('/students/:_id', ensurePostPutDeleteIsAuthorized, ensureAuthenticated,function(req, res, next){    
    var id = req.params._id;       

        Students.deleteStudent (id, function(err, student){
        if (err){ return console.log(err);
        }   
           res.sendStatus(200);
        });    

    });

   //Delete Messaged student
    goziextech.delete('/messaged/delete/:_id', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){

    var id = req.params._id;    
    var studentid = req.body.id; 

        Universities.deleteUniversityMessagedstudent (id, studentid, {}, function(err, deletedstudent){
        if (err){ return console.log (err);
        }   
           res.json(deletedstudent);
        });    

    });



    //Handle Contact Message to Student
    goziextech.post('/message', ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){
        //Declare Variables
        var stdntfnmae = req.body.first_name;
        var stdntlname = req.body.last_name;
        var stdntcourse = req.body.course;
        var stdntuniversity = req.body.university;
        var stdnteml = req.body.email;
        var uvrstynm = req.body.university;
        var uvstem = req.body.university_email;
        var message = req.body.message;
        var applicationportal = req.body.applicationportal;
        var plaintext = uvrstynm + ' sent you a message: '+  message ;
        
        let unimessageSentToStudent = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: uvrstynm + ' sent you a message' ,
            text: plaintext, // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 0px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="http://www.studyinbudapest.com" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><center><div style="background:#grey; padding:20px; color:black;"><div style="background-color:red; color:white; width:25px; height:25px; border-radius:20px; display:inline-block; margin-right:5px;"><center>1</center></div> Message for '+ stdntfnmae +' '+ stdntlname +'</div> </center><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td>You have unread message from <b>'+ uvrstynm +'</b></td><td align="left" width="100"></td></tr><tr><td colspan="2" style="padding:20px 0; border-top:1px solid #f6f6f6;"><div><table width="100%" cellpadding="0" cellspacing="0"><tbody><tr><div style="font-family:"verdana"; font-size: 15px; background:#F9F9FC; color:black; line-height: normal;"><p>'+ message +'</p></div></tr><tr class="total"><td style="font-family: "arial"; font-size: 14px; vertical-align: middle; border-top-width: 1px; border-top-color: #f6f6f6; border-top-style: solid; margin: 0; padding: 9px 0;" width="80%"><center><a href="mailto:'+ uvstem +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Reply Message</a></center></td></tbody></table></div></td></tr><tr><td colspan="2"><center></center><b>- Thanks Studyinbudapest<br><center><a href="http://www.studyinbudapest.com/download-api"><img src="http://www.studyinbudapest.com/images/emailassets/applegoole.png" alt="Studyinbudapest" style="border:none; display:block; width:60%"></a></center></b> </td></tr></tbody></table></div><center><div style="margin-top:20px"><a href="https://www.facebook.com/studyingbudapest"><img src="http://recruitment.studyinbudapest.com/plugins/images/Facebook-Icon-Circle-Outline-Grey.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="tel:+12019921664"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_phone_281830.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%; "></a><a href="https://www.instagram.com/studyinbudapst"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_instagram_281827.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="https://twitter.com/studyinbudapst"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_twitter_281833.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="https://www.youtube.com/channel/UCxVJxK_vB8Oi5fqUFU8-I4g?view_as=subscriber"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_youtube_281826.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a></div></center><div style="text-align: center; font-size: 12px; color: #b2b2b5; line-height: normal;"><p> Powered by Goziex Technologies Limited </p><p>This email was intended for '+ stdntfnmae +' '+ stdntlname +'  ('+ stdntcourse +' at '+ stdntuniversity +'). <a href="http://help.studyinbudapest.com">Learn why you are recieving this message </a> </p><p> © Study in Budapest, Study in Europe, is a registered business of Goziex Technologies LLC Company.</p></div></div></div></body>'
        };
        
        transporter.sendMail(unimessageSentToStudent, (error, info) => {
           if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            //console.log('Message sent: %s', info.messageId);
            //console.log(mailOptions);
        }); 
    });

    
   //Handle Contact Message to Student
    goziextech.post('/applymail', ensurePostPutDeleteIsAuthorized, function(req, res, next){

        //Declare Variables
        var stdntfnmae = req.body.first_name;
        var stdntlname = req.body.last_name;
        var stdnteml = req.body.email;
        var stdntcountry = req.body.country;
        var studyinbudapestemail = "admissions@studyinbudapest.com"; 
        var uvrstynm = req.body.university;
        var course = req.body.course;
        var baseurl = "http://app.studyinbudapest.com/";
        var applicationportal = "http://www.studyinbudapest.com/search-universities";
        var universityemail= "admissions@studyinbudapest.com";
        var amount = req.body.amount; 
        var date = req.body.date_of_activity;
        var sibdashboardsite = "http://recruitment.studyinbudapest.com";
        
        if (uvrstynm == "Mcdaniels College"){
         var applicationportal = baseurl + "apply-to-mcdaniel.html";
         var universityemail = "admissions@mcdaniel.hu";    
            
        } else if (uvrstynm == "Budapest Metropolitan University") {
         var applicationportal = baseurl + "apply-to-metropolitan.html";
         var universityemail = "international@metropolitan.hu";    
           
        } else if (uvrstynm == "Eotvos Lorand University") {
         var applicationportal = baseurl + "apply-to-elte.html";
         var universityemail = "iso@btk.elte.hu";     
                
        } else if (uvrstynm == "International Business School") {
         var applicationportal = baseurl + "apply-to-ibs.html";
         var universityemail = "info@ibs-b.hu";    
            
        } else if (uvrstynm == "Budapest Arts & Design University") {
         var applicationportal = baseurl + "apply-to-mome.html";
         var universityemail = "nemeth@mome.hu";   
            
        } else if (uvrstynm == "Semmelweis Medical University") {
         var applicationportal = baseurl + "apply-to-semmelweis.html";
         var universityemail = "english.secretariat@semmelweis-univ.hu";
            
        } else if (uvrstynm == "Budapest University of Science") {
         var applicationportal = baseurl + "apply-to-bme.html";
          var universityemail = "admission@kth.bme.hu";
            
        } else if (uvrstynm == "Corvinus University") {
         var applicationportal = baseurl + "apply-to-corvinus.html";
         var universityemail = "intoffice@uni-corvinus.hu";   
            
        } else if (uvrstynm == "Budapest Business School") {
         var applicationportal = baseurl + "apply-to-bgf.html";   
         var universityemail = "admission@kth.bme.hu";
            
        } else if (uvrstynm == "Central European University") {
         var applicationportal = baseurl + "apply-to-ceu.html";
         var universityemail = "communications_office@ceu.edu"; 
            
        } else {
          var applicationportal = applicationportal;
          var universityemail = universityemail;    
        } //End url check  
        
        //Apply mail
        let applyMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: stdntfnmae + ' you started a new application '+ uvrstynm,
            text: 'Application Recieved', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ stdntfnmae +'</b><p> Your application to study <b>'+ course +'</b> at <b>'+ uvrstynm +'</b> has been processed by our app, however to complete your application, please make sure that you complete the university registration form as well, if you do not complete the registration form on the university website or portal, your application will not be processed by the university, if you skipped this step or abandoned the university form on their website, you can continue here</p><center><a href="'+ applicationportal +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Continue </a></center><p>If you will like to ask a question from the university, you can contact the university with a click away</p><center><a href="mailto:'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #32CD32; border-radius: 60px; text-decoration:none;"> Message </a></center><p>Study in Budapest connects you with universities and makes it easy for you to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app.</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };
        
        //SIB notify mail
        let paymentNotifyMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: studyinbudapestemail, // list of receivers
            subject:'Payment Recieved: ' + stdntfnmae +' '+ stdntlname +  ' Has Payed for ' + uvrstynm ,
            text: 'Payment Recieved', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><p><b>' + stdntfnmae +' '+ stdntlname +  '</b> has completed payment for processing fee to start application to study <b>'+ course +'</b> at <b>'+ uvrstynm +'</b> you can check the status of the university website here </p><center><a href="'+ applicationportal +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> University Website </a></center><p>If you will like to ask a question from the student, you can send a message to '+ stdnteml +'</p><center><a href="mailto:'+ stdnteml +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #32CD32; border-radius: 60px; text-decoration:none;"> Message </a></center><p>Study in Budapest connects you with universities and makes it easy for you to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app.</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };
        
        // setup email data with unicode symbols
        let invoice = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: ' Payment Reciept' , 
            text: 'Your invoice is enclosed', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="background:#1e88e5; padding:20px; color:#fff; text-align:center;"> Goziex Technologies Limited </td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ stdntfnmae +' '+ stdntlname +'</b><p style="margin-top:0px;">Invoice</p></td><td align="right" width="100"> '+ date +'</td></tr><tr><td colspan="2" style="padding:20px 0; border-top:1px solid #f6f6f6;"><div><table width="100%" cellpadding="0" cellspacing="0"><tbody><tr><td style="font-family: "arial"; font-size: 14px; vertical-align: middle; margin: 0; padding: 9px 0;">'+ course +'</td><td style="font-family: "arial"; font-size: 14px; vertical-align: middle; margin: 0; padding: 9px 0;"  align="right">€ '+ amount +'</td></tr><tr class="total"> <td style="font-family: "arial"; font-size: 14px; vertical-align: middle; border-top-width: 1px; border-top-color: #f6f6f6; border-top-style: solid; margin: 0; padding: 9px 0; font-weight:bold;" width="80%">Total</td><td style="font-family: "arial"; font-size: 14px; vertical-align: middle; border-top-width: 1px; border-top-color: #f6f6f6; border-top-style: solid; margin: 0; padding: 9px 0; font-weight:bold;" align="right">€ '+ amount +'</td></tr></tbody></table></div></td></tr><tr><td colspan="2"><center></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited.<br/> If you have any questions regarding this invoice please contact <a href="http://help.studyinbudapest.com">support<a/></p></div></div></div></body>'
        };

        res.sendStatus(200);
        
        // Invoice
        transporter.sendMail(invoice, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
        
        transporter.sendMail(applyMail, (error, info) => {
           if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
        
        transporter.sendMail(paymentNotifyMail, (error, info) => {
           if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        });   

        
        
    });

//Handle Contact Message to Student
    goziextech.post('/applymailfoc', ensurePostPutDeleteIsAuthorized, function(req, res, next){

        //Declare Variables
        var stdntfnmae = req.body.first_name;
        var stdntlname = req.body.last_name;
        var stdnteml = req.body.email;
        var stdntcountry = req.body.country;
        var studyinbudapestemail = "admissions@studyinbudapest.com"; 
        var uvrstynm = req.body.university;
        var course = req.body.course;
        var baseurl = "http://app.studyinbudapest.com/";
        var applicationportal = "http://www.studyinbudapest.com/search-universities";
        var universityemail= "admissions@studyinbudapest.com";
        var amount = req.body.amount; 
        var date = req.body.date_of_activity;
        var sibdashboardsite = "http://recruitment.studyinbudapest.com";
        
        if (uvrstynm == "Mcdaniels College"){
         var applicationportal = baseurl + "apply-to-mcdaniel.html";
         var universityemail = "admissions@mcdaniel.hu";    
            
        } else if (uvrstynm == "Budapest Metropolitan University") {
         var applicationportal = baseurl + "apply-to-metropolitan.html";
         var universityemail = "international@metropolitan.hu";    
           
        } else if (uvrstynm == "Eotvos Lorand University") {
         var applicationportal = baseurl + "apply-to-elte.html";
         var universityemail = "iso@btk.elte.hu";     
                
        } else if (uvrstynm == "International Business School") {
         var applicationportal = baseurl + "apply-to-ibs.html";
         var universityemail = "info@ibs-b.hu";    
            
        } else if (uvrstynm == "Budapest Arts & Design University") {
         var applicationportal = baseurl + "apply-to-mome.html";
         var universityemail = "nemeth@mome.hu";   
            
        } else if (uvrstynm == "Semmelweis Medical University") {
         var applicationportal = baseurl + "apply-to-semmelweis.html";
         var universityemail = "english.secretariat@semmelweis-univ.hu";
            
        } else if (uvrstynm == "Budapest University of Science") {
         var applicationportal = baseurl + "apply-to-bme.html";
          var universityemail = "admission@kth.bme.hu";
            
        } else if (uvrstynm == "Corvinus University") {
         var applicationportal = baseurl + "apply-to-corvinus.html";
         var universityemail = "intoffice@uni-corvinus.hu";   
            
        } else if (uvrstynm == "Budapest Business School") {
         var applicationportal = baseurl + "apply-to-bgf.html";   
         var universityemail = "admission@kth.bme.hu";
            
        } else if (uvrstynm == "Central European University") {
         var applicationportal = baseurl + "apply-to-ceu.html";
         var universityemail = "communications_office@ceu.edu"; 
            
        } else {
          var applicationportal = applicationportal;
          var universityemail = universityemail;    
        } //End url check  
        
        //Apply mail
        let applyMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: stdntfnmae + ' you started a new application '+ uvrstynm,
            text: 'Application Recieved', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ stdntfnmae +'</b><p> Your application to study <b>'+ course +'</b> at <b>'+ uvrstynm +'</b> has been processed by our app, however to complete your application, please make sure that you complete the university registration form as well, if you do not complete the registration form on the university website or portal, your application will not be processed by the university, if you skipped this step or abandoned the university form on their website, you can continue here</p><center><a href="'+ applicationportal +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Continue </a></center><p>If you will like to ask a question from the university, you can contact the university with a click away</p><center><a href="mailto:'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #32CD32; border-radius: 60px; text-decoration:none;"> Message </a></center><p>Study in Budapest connects you with universities and makes it easy for you to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app.</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };
        
        res.sendStatus(200);
        transporter.sendMail(applyMail, (error, info) => {
           if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
        
      

        
        
    });


//Handle Contact Message to Student
    goziextech.post('/ride', ensurePostPutDeleteIsAuthorized, function(req, res, next){

        //Declare Variables
        var stdntfnmae = req.body.first_name;
        var stdntlname = req.body.last_name;
        var stdnteml = req.body.email;
        
        let taxiMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: stdntfnmae + ' you requested a ride' ,
            text: 'Your ride is on the way', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ stdntfnmae +'</b><p>We recieved your request for a ride, as soon as you complete your location and pick up details on the uber platform, Uber takes it up from there and we hope you enjoy your ride, however if you did not complete your booking with uber you can do it now </p><center><a href="https://m.uber.com/ul/?action=setPickup&client_id=VhepL7PPqkD2ClkUvOTgxb8_OJiexB6z&pickup=my_location&dropoff[formatted_address]=Budapest%2C%20Hungary&dropoff[latitude]=47.497912&dropoff[longitude]=19.040235" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Get your ride </a></center><p>Study in Budapest partners and leaverages Uber Technologies as one of the leading taxi technology company in the world and we believe in using technology to solve problems for international students.</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };
        
        
        transporter.sendMail(taxiMail, (error, info) => {
           if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
         
        
    });

   //Handle Contact Message to Student
    goziextech.post('/help', ensurePostPutDeleteIsAuthorized,function(req, res, next){

        //Declare Variables
        var stdntfnmae = req.body.first_name;
        var stdntlname = req.body.last_name;
        var stdnteml = req.body.email;
        var stdntmsg = req.body.message;
        var subject = req.body.subject;
        
        let helpMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: stdntfnmae + ' you asked for help!' ,
            text: 'You asked for help!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ stdntfnmae +'</b><p>Hang in there for a sec, a Studyinbudapest representative will provide answer to your question on <b>"'+ subject +'"</b><br> However, while you wait for quick help could you</p><center><a href="http://help.studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Lookup Answers </a></center><p>If you need to speak to a representative , you can reach us at +1 (201) - 992- 1664</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };
        
          let adminMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: "admissions@studyinbudapest.com", // list of receivers
            subject: stdntfnmae + ' asked for help!' ,
            text: 'You asked for help!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><p><b>'+ stdntfnmae +'</b>'+" "+'<b>'+ stdntlname +'</b> Submitted a help request with the subject: <b>'+ subject +'</b><br> and the following message: <b>"'+ stdntmsg +'"</b></p><center><a href="mailto:'+ stdnteml+'?subject=RE:'+ subject+'&body='+ stdntmsg +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Send Reply </a></center><p>If you need to lookup answers for the students, you can visit the <a href="http://help.studyinbudapest.com" target="_blank">help center</a></p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };
        
        res.sendStatus(200);
        transporter.sendMail(helpMail, (error, info) => {
           if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
        
        transporter.sendMail(adminMail, (error, info) => {
           if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
         
        
    });


 //Handle Contact Message to Student
    goziextech.post('/visa', ensurePostPutDeleteIsAuthorized, function(req, res, next){
        //Declare Variables
        var stdntfnmae = req.body.first_name;
        var stdntlname = req.body.last_name;
        var stdnteml = req.body.email;
        var embassy = req.body.embassy;
        if (embassy == "others"){
         var embassy = "in your country";   
        } else {
          var embassy = req.body.embassy;  
        }
        
        let visaAppointmentMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: stdntfnmae + ' ' + stdntlname + ' Visa Appointment Confirmation!' ,
            text: 'Confirm your appointment!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ stdntfnmae +'</b><p>To complete your student visa interview booking for the hungarian embassy in your country simply use the following button:</p><center><a href="https://ifr.mfa.gov.hu/Idopontfoglalas/Pages/Idopontfoglalas.aspx" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Select interview date </a></center><p>Study in Budapest connects you with universities and makes it easy for you to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app.<br><br> If you need to speak to a representative , you can reach us at +1 (201) - 992- 1664</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };
        
        res.sendStatus(200);
        
        transporter.sendMail(visaAppointmentMail, (error, info) => {
           if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
         
        
    });


   //Handle Contact Message to Student
    goziextech.post('/docucheck', ensurePostPutDeleteIsAuthorized, function(req, res, next){
    
        //Declare Variables
        var stdntfnmae = req.body.first_name;
        var stdntlname = req.body.last_name;
        var stdnteml = req.body.email;
        var checkingtype = req.body.checkingtype;
        var sibemail = "admissions@studyinbudapest.com";
        
        let docuCheckMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: stdntfnmae + ' You requested a document verification!' ,
            text: 'Your requested a document verification!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ stdntfnmae +'</b><p>We have received your visa eligibility check, our legal experts and professionals will have a look at your documents and send you an email on your eligibility and your chances of getting a student visa, if you will like to try your knowledge on questions the embassy may ask, you can use the visa section of our app </p><center><a href="http://www.studyinbudapest.com/download-api" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Take Practise Test </a></center><p>Study in Budapest connects you with universities and makes it easy for you to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app.<br><br> If you need to speak to a representative , you can reach us at +1 (201) - 992- 1664</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited</p></div></div></div></body>'
        };
        
        let docuCheckMailToSIBorLawyer = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: sibemail, // list of receivers
            subject: stdntfnmae + ' requested a document verification!' ,
            text: 'A student requested a document verification!', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><p> <b>'+ stdntfnmae +'</b> needs a document check, you can respond to this students if you have legal expert or professionals knowledge if the documents uploaded are the right documents, you can have a look at the documents </p><center><a href="http://www.dropbox.com/" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Download Documents </a></center><p>Study in Budapest connects you with universities and makes it easy for you to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app.<br><br> If you need to speak to a representative , you can reach us at +1 (201) - 992- 1664</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };
        
        res.sendStatus(200);
        transporter.sendMail(docuCheckMail, (error, info) => {
           if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
         
        transporter.sendMail(docuCheckMailToSIBorLawyer, (error, info) => {
           if (error) {
                //res.sendStatus(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
        
    });

    //Handle Contact Message to Student
    goziextech.post('/checkstatus', ensurePostPutDeleteIsAuthorized, function(req, res, next){

        //Declare Variables
        var stdntfnmae = req.body.first_name;
        var stdnteml = req.body.email;
        var uvrstynm = req.body.university;
        var course = req.body.course;
        var applicationportal = "http://www.studyinbudapest.com/search-universities";
        var baseurl = "http://app.studyinbudapest.com/";
        var universityemail= "admissions@studyinbudapest.com";
        var sibdashboardsite = "http://recruitment.studyinbudapest.com";
        
        if (uvrstynm == "Mcdaniels College"){
         var applicationportal = baseurl + "apply-to-mcdaniel.html";
         var universityemail = "admissions@mcdaniel.hu";    
            
        } else if (uvrstynm == "Budapest Metropolitan University") {
         var applicationportal = baseurl + "apply-to-metropolitan.html";
         var universityemail = "international@metropolitan.hu";    
           
        } else if (uvrstynm == "Eotvos Lorand University") {
         var applicationportal = baseurl + "apply-to-elte.html";
         var universityemail = "iso@btk.elte.hu";     
                
        } else if (uvrstynm == "International Business School") {
         var applicationportal = baseurl + "apply-to-ibs.html";
         var universityemail = "info@ibs-b.hu";    
            
        } else if (uvrstynm == "Budapest Arts & Design University") {
         var applicationportal = baseurl + "apply-to-mome.html";
         var universityemail = "nemeth@mome.hu";   
            
        } else if (uvrstynm == "Semmelweis Medical University") {
         var applicationportal = baseurl + "apply-to-semmelweis.html";
         var universityemail = "english.secretariat@semmelweis-univ.hu";
            
        } else if (uvrstynm == "Budapest University of Science") {
         var applicationportal = baseurl + "apply-to-bme.html";
          var universityemail = "admission@kth.bme.hu";
            
        } else if (uvrstynm == "Corvinus University") {
         var applicationportal = baseurl + "apply-to-corvinus.html";
         var universityemail = "intoffice@uni-corvinus.hu";   
            
        } else if (uvrstynm == "Budapest Business School") {
         var applicationportal = baseurl + "apply-to-bgf.html";   
         var universityemail = "admission@kth.bme.hu";
            
        } else if (uvrstynm == "Central European University") {
         var applicationportal = baseurl + "apply-to-ceu.html";
         var universityemail = "communications_office@ceu.edu"; 
            
        } else {
          var applicationportal = applicationportal;
          var universityemail = universityemail;    
        } //End url check  
        
    
        let statusMail = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: stdntfnmae + ' continue your application to '+ uvrstynm,
            text: 'Continue your application', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8;"><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ stdntfnmae +'</b><p> Here is how you can check the status of your application to study <b>'+ course +'</b> at <b>'+ uvrstynm +'</b>, you can email the university or click on the continue button, please make sure that you complete the university registration form as well, if you do not complete the registration form on the university website or portal, your application will not be completely processed by the university, if you skipped this step or abandoned the university form on their website, you can continue here</p><center><a href="'+ applicationportal +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Continue Application</a></center><center><a href="mailto:'+ universityemail +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #32CD32; border-radius: 60px; text-decoration:none;"> Email the university</a></center><p>Study in Budapest connects you with universities and makes it easy for you to apply for admission to one university and get recruited by multiple universities, travel, visa, and city guide in one app.</p><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'
        };
        res.sendStatus(200);
        transporter.sendMail(statusMail, (error, info) => {
           if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
        }); 
    });
     //Travel Message
     goziextech.post('/trvl/msg', ensurePostPutDeleteIsAuthorized, ensureAuthenticated,function(req, res, next){

        var stdnteml = req.body.studentemail;
        var fname = (req.body.studentname).toUpperCase();
        var admsnofcr = req.body.admsnofcr;
        var uvrstynm = req.body.universityname; 

        // setup email data with unicode symbols

        let TravelMessage = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject: fname + ' You Recieved a Travel Assistance Package' ,
            text: 'You Recieved a Travel Assistance Package', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="http://www.studyinbudapest.com/" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>Hi '+ fname +',</b><center><p><b>'+ admsnofcr +'</b> from <b>'+ uvrstynm +'</b> has just sent you the following travel services</p></center><center><img src="http://www.studyinbudapest.com/images/emailassets/aiport-taxi-em-study-in-budapest-study-in-europe-mobile-app-img1%20copy.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"><a href="http://www.studyinbudapest.com/download-api" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Airport Taxi </a></center><center><center><img src="http://www.studyinbudapest.com/images/emailassets/student-accomodation-hostel-em-study-in-budapest-study-in-europe-mobile-app-img1%20copy.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"><a href="http://www.studyinbudapest.com/download-api" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Find Hostel </a></center><center><img src="http://www.studyinbudapest.com/images/emailassets/student-flights-em-study-in-budapest-study-in-europe-mobile-app-img1%20copy.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"><a href="http://www.studyinbudapest.com/download-api" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Book Flight </a></center><center><img src="http://www.studyinbudapest.com/images/emailassets/travel-em-study-in-budapest-study-in-europe-mobile-app-image.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"><a href="http://www.studyinbudapest.com/download-api" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Insurance </a></center></center><b>- Thanks Studyinbudapest<br><center><a href="http://www.studyinbudapest.com/download-api"><img src="http://www.studyinbudapest.com/images/emailassets/applegoole.png" alt="Studyinbudapest" style="border:none; display:block; width:60%"></a></center></b> </td></tr></tbody></table></div><center><div style="margin-top:20px"><a href="https://www.facebook.com/studyingbudapest"><img src="http://recruitment.studyinbudapest.com/plugins/images/Facebook-Icon-Circle-Outline-Grey.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="tel:+12019921664"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_phone_281830.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%; "></a><a href="https://www.instagram.com/studyinbudapst"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_instagram_281827.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="https://twitter.com/studyinbudapst"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_twitter_281833.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="https://www.youtube.com/channel/UCxVJxK_vB8Oi5fqUFU8-I4g?view_as=subscriber"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_youtube_281826.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a></div></center><div style="text-align: center; font-size: 12px; color: #b2b2b5; line-height: normal;"><p> Powered by Goziex Technologies Limited </p><p>This email was intended for '+ fname +' from '+ uvrstynm +'. <a href="http://help.studyinbudapest.com">Learn why you are recieving this message </a> </p><p> © Study in Budapest, Study in Europe, is a registered business of Goziex Technologies LLC Company.</p><br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div></body>'

        };

        // send mail with defined transport object
        transporter.sendMail(TravelMessage, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
                  //console.log("Travel Message Sent");
            }
           
        }); 
         
    });


    //Travel Message
         goziextech.post('/tvap/msg',ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){

        var stdnteml = req.body.studentemail;
        var uvrstynm = req.body.universityname; 

        // setup email data with unicode symbols

        let TvapMessage = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: stdnteml, // list of receivers
            subject:' You Recieved a Travel Assistance Package' ,
            text: 'You Recieved a Travel Assistance Package', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>Hi,</b><center><p><b>'+ uvrstynm +'</b> has just sent you the following travel services</p></center><center><img src="http://www.studyinbudapest.com/images/emailassets/aiport-taxi-em-study-in-budapest-study-in-europe-mobile-app-img1%20copy.png" alt="Studyinbudapest" style="border:none; display:block; width:30%"><a href="http://www.studyinbudapest.com/download-api" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Airport Taxi </a></center><center><center><img src="http://www.studyinbudapest.com/images/emailassets/student-accomodation-hostel-em-study-in-budapest-study-in-europe-mobile-app-img1%20copy.png" alt="Studyinbudapest" style="border:none; display:block; width:30%"><a href="http://www.studyinbudapest.com/download-api" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Find Hostel </a></center><center><img src="http://www.studyinbudapest.com/images/emailassets/student-flights-em-study-in-budapest-study-in-europe-mobile-app-img1%20copy.png" alt="Studyinbudapest" style="border:none; display:block; width:30%"><a href="http://www.studyinbudapest.com/download-api" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Book Flight </a></center><center><img src="http://www.studyinbudapest.com/images/emailassets/travel-em-study-in-budapest-study-in-europe-mobile-app-image.png" alt="Studyinbudapest" style="border:none; display:block; width:30%"><a href="http://www.studyinbudapest.com/download-api" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> Insurance </a></center></center><b>- Thanks Studyinbudapest<br><center><a href="http://www.studyinbudapest.com/download-api"><img src="http://www.studyinbudapest.com/images/emailassets/applegoole.png" alt="Studyinbudapest" style="border:none; display:block; width:60%"></a></center></b> </td></tr></tbody></table></div><center><div style="margin-top:20px"><a href="https://www.facebook.com/studyingbudapest"><img src="http://recruitment.studyinbudapest.com/plugins/images/Facebook-Icon-Circle-Outline-Grey.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="tel:+12019921664"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_phone_281830.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%; "></a><a href="https://www.instagram.com/studyinbudapst"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_instagram_281827.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="https://twitter.com/studyinbudapst"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_twitter_281833.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a><a href="https://www.youtube.com/channel/UCxVJxK_vB8Oi5fqUFU8-I4g?view_as=subscriber"><img src="http://recruitment.studyinbudapest.com/plugins/images/if_youtube_281826.png" alt="Studyinbudapest" style="border:none; display:inline-block; width:10%;"></a></div></center><div style="text-align: center; font-size: 12px; color: #b2b2b5; line-height: normal;"><p> Powered by Goziex Technologies Limited </p><p>This email was intended for '+ stdnteml +'. <a href="http://help.studyinbudapest.com">Learn why you are recieving this message </a> </p><p> © Study in Budapest, Study in Europe, is a registered business of Goziex Technologies LLC Company.</p><br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration:underline;">Unsubscribe</a> </p></div></div></div>'

        };

        // send mail with defined transport object
        transporter.sendMail(TvapMessage, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            console.log('Message sent: %s', info.messageId);
            console.log(TvapMessage);
        });    
    });

       //Verify Message Welcome
        goziextech.post('/confirm/email', ensurePostPutDeleteIsAuthorized, function(req, res, next){
        var fname = (req.body.first_name).toUpperCase();
        var lname = req.body.last_name;
        var uvrstynm = req.body.university;
        var uvstem = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var country = req.body.country;

        // setup email data with unicode symbols

        let verifyMailOptions = {

        from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: uvstem, // list of receivers
            subject: fname + ' please verify your '+ uvrstynm +' email address' , 
            text: 'Verify your email address', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><center><p>Please verify your email address to activate your account</p></center><center><a href="http://recruitment.studyinbudapest.com/#/verify/'+ uvstem +'" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#00BF4B; border-radius: 60px; text-decoration:none;"> Verfiy your email</a></center><center><b>Are you '+ uvrstynm +' verification steps ?</b></center> As part of our data privacy and user protection, your account will need further verification to confirm if you are a university.<br> <br> <b>Step 1:</b> We will give your university a call on the number you provided on registration <br><b>Step 2:</b> We will send an email to your university admission email address to confirm if it is functional and truly owned by a university <br><br>   You can start using your account, as soon as we finish our verification, usually by phone or email.<br>Be sure, we will be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: <b>1 (201) 992-1664 </b><center><a href="mailto:admissions@studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background:#1e88e5; border-radius: 60px; text-decoration:none;"> Check verification status</a><br></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited <br><a href="javascript: void(0);" style="color: #b2b2b5; text-decoration: underline;">Unsubscribe</a></p></div></div></div></body>'

        };

        // send mail with defined transport object
        transporter.sendMail(verifyMailOptions, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            console.log('Message sent: %s', info.messageId);
            console.log(verifyMailOptions);
        });    
    });


    //Message Welcome
    goziextech.post('/uni/wmsg', ensurePostPutDeleteIsAuthorized,function(req, res, next){  
        var fname = (req.body.first_name).toUpperCase();
        var lname = req.body.last_name;
        var uvrstynm = req.body.university;
        var uvstem = req.body.email;
        var username = uvstem;
        var password = req.body.password;
        var country = req.body.country;

        let mailOptions = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: uvstem, // list of receivers
            subject: fname + ' Welcome to Study in Budapest' , 
            text: 'Welcome to Studyinbudapest', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ fname +',</b><center><p>Welcome to Studyinbudapest meet your dashboard, your one stop recruitment easy to use tool, you can now start recruiting international students for free </p></center><center><p>Your username is: <strong>'+ username +'</strong></p></center><center><img src="http://www.studyinbudapest.com/images/emailassets/university%20dasboard%202018.png" style="display:block; width:80%"></center><center><a href="http://recruitment.studyinbudapest.com" style="display: inline-block; padding: 11px 30px; margin: 20px 0px 30px; font-size: 15px; color: #fff; background: #1e88e5; border-radius: 60px; text-decoration:none;"> View Applicants </a></center><center><p>Every week international students are applying to other universities in your area and you can recruit them for FREE</p></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited </p></div></div></div></body>'

        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            console.log('Message sent: %s', info.messageId);
            console.log(mailOptions);
        });
    //res.end();

    });

   //Handle Recruit Messages
    goziextech.post('/invoice',ensurePostPutDeleteIsAuthorized, ensureAuthenticated, function(req, res, next){

        
        //Declare Variables
        var universityname = req.body.universityname;
        var universityemail = req.body.universityemail;
        var plan = req.body.plan;
        var amount = req.body.amount; 
        var date = req.body.date;
        
        // setup email data with unicode symbols
        let invoice = {
            from: '"Studyinbudapest Mobile App" <admissions@studyinbudapest.com', // sender address
            to: universityemail, // list of receivers
            subject: ' Payment Reciept' , 
            text: 'Your invoice is enclosed', // plain text body
            html: '<body style="margin:0px; background: #f8f8f8; "><div width="100%" style="background: #f8f8f8; padding: 0px 0px; font-family:arial; line-height:28px; height:100%;  width: 100%; color: #514d6a;"><div style="max-width: 700px; padding:50px 0;  margin: 0px auto; font-size: 14px"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px"><tbody><tr><td style="vertical-align: top; padding-bottom:30px;" align="center"><a href="javascript:void(0)" target="_blank"><img src="http://www.studyinbudapest.com/images/study-in-budapest-mobile-app-icon-study-abroad-european-universities-round.png" alt="Studyinbudapest" style="border:none; display:block; width:10%"></td></tr></tbody></table><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td style="background:#1e88e5; padding:20px; color:#fff; text-align:center;"> Goziex Technologies Limited </td></tr></tbody></table><div style="padding: 40px; background: #fff;"><table border="0" cellpadding="0" cellspacing="0" style="width: 100%;"><tbody><tr><td><b>'+ universityname +'</b><p style="margin-top:0px;">Invoice</p></td><td align="right" width="100"> '+ date +'</td></tr><tr><td colspan="2" style="padding:20px 0; border-top:1px solid #f6f6f6;"><div><table width="100%" cellpadding="0" cellspacing="0"><tbody><tr><td style="font-family: "arial"; font-size: 14px; vertical-align: middle; margin: 0; padding: 9px 0;">'+ plan +'</td><td style="font-family: "arial"; font-size: 14px; vertical-align: middle; margin: 0; padding: 9px 0;"  align="right">€ '+ amount +'</td></tr><tr class="total"> <td style="font-family: "arial"; font-size: 14px; vertical-align: middle; border-top-width: 1px; border-top-color: #f6f6f6; border-top-style: solid; margin: 0; padding: 9px 0; font-weight:bold;" width="80%">Total</td><td style="font-family: "arial"; font-size: 14px; vertical-align: middle; border-top-width: 1px; border-top-color: #f6f6f6; border-top-style: solid; margin: 0; padding: 9px 0; font-weight:bold;" align="right">€ '+ amount +'</td></tr></tbody></table></div></td></tr><tr><td colspan="2"><center></center><b>- Thanks Studyinbudapest</b> </td></tr></tbody></table></div><div style="text-align: center; font-size: 12px; color: #b2b2b5; margin-top: 20px"><p> Powered by Goziex Technologies Limited.<br/> If you have any questions regarding this invoice please contact <a href="http://help.studyinbudapest.com">support<a/></p></div></div></div></body>'
        };

        // send mail with defined transport object
        transporter.sendMail(invoice, (error, info) => {
            if (error) {
                //res.send(500);
                return console.log(error);
            } else {
                  res.sendStatus(200);
            }
            console.log('Message sent: %s', info.messageId);
            console.log(invoice);
        }); 
    });


     process.on('uncaughtException', function (err) {
     return console.log(err);
     });

    goziextech.listen(3000);
    console.log('Goziex Tech Server is running on port:' + port);