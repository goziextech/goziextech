
    var myApp = angular.module('myApp'); //Extension of myApp

    myApp.filter('reverse', function() {
      return function(items) {
      if (!items || !items.length) { return; }
        return items.slice().reverse();
      };
    });

     //---------------END-----------------// 

    myApp.controller('studentsController',['$scope', '$http', '$location', '$routeParams','$anchorScroll','$templateCache', function($scope, $http, $location,  $routeParams, $anchorScroll, $templateCache){
   
       //$templateCache.removeAll();
        $(".heartbit").hide();
        $(".point").hide();   
         
       
        var h = $(".w-button").height();
        var w = $(".w-button").width();
        /*alert(h);
        alert(w);*/
        var codeprintdata = { "w": w, "cp": h }
        /* Autheticate user */
        $scope.authenticate = function(){    
        $http({
            method : "POST",
            url : "http://localhost:3000/authentication",
            data: codeprintdata
        }).then(function(response){ 
        var userid = response.data._id;
        var numberofappliedstudents = response.data.number_of_students;
        var notificationbadgeoff = response.data.notification_badge == "off";
        var notificationbadgeon = response.data.notification_badge == "on";    
        if (!userid){    
          window.location.href = "/";
        } else {   
        //Auth
        }
        
      /*  var foucused;
        window.onfocus = function(){
        foucused = true;
        console.log(foucused);
        checkForNewApplicants (numberofappliedstudents);    
        }
        window.onblur=function(){
        foucused = false;
        console.log(foucused);    
         }*/               
         checkForNewApplicants (numberofappliedstudents);
         function checkForNewApplicants (numberofappliedstudents){
         /* START NOTIFICATION SETTINGS*/ 
            $http({
            method : "POST",
            url : "http://localhost:3000/allstudents",
            data: codeprintdata
            }).then(function  (response){
            var currentnumberofstudents = response.data.length;
           // alert(currentnumberofstudents);          
              if(currentnumberofstudents > numberofappliedstudents) {  
              $(".heartbit").show();
              $(".point").show();
              $("#alerttopright").fadeToggle(350);    
               //alert(currentnumberofstudents);
               $(".notification-dropdown").click(function(){ 
            var uid = userid;
            var editurl = "http://localhost:3000/edit/universities/applied/" + uid
            console.log("About to update and switch off icon"); 
               $http({
               method : "PUT",
                url : editurl,
                data: {
                "number_of_students":currentnumberofstudents,
                "w":w,
                "cp":h    
                }
               }) //End Update Http 
               
               //console.log("Notification will be turned off");   
               $(".heartbit").hide();
               $(".point").hide(); 
               var indicatorishidden = $(".heartbit").hide();
               var pointerishidden = $(".point").hide();       
               
                if (indicatorishidden && pointerishidden){
                  $(".notification-dropdown").off("click");  
                }   
                 
               }); //End Click to off
                  
              $(".myadmin-alert .closed").click(function(){ 
            var uid = userid;
            var editurl = "http://localhost:3000/edit/universities/applied/" + uid
            console.log("About to update and switch off icon"); 
               $http({
               method : "PUT",
                url : editurl,
                data: {
                "number_of_students":currentnumberofstudents,
                 "w":w,
                "cp":h     
                }
               }) //End Update Http 
               
               //console.log("Notification will be turned off");    
               $(".heartbit").hide();
               $(".point").hide(); 
               var indicatorishidden = $(".heartbit").hide();
               var pointerishidden = $(".point").hide();       
               
                if (indicatorishidden && pointerishidden){
                  $(".mdi-gmail").off("click");  
                }   
                 
               }); //End Click to off           
                       
            } else if (numberofappliedstudents == currentnumberofstudents) {
               $(".heartbit").hide();
               $(".point").hide(); 
            }     
           });       
     /*END OF NOTIFICATION SETTINGS*/          
        }    
         
       
        var accountinactive = (response.data.activation) == "notactivated";
        var emailinactive = (response.data.verification_status) == "no";       
       if (accountinactive) {
            swal({   
                title: "Not Activated",   
                text: "We will like to make sure that you are a university we will send an email to " + response.data.email + " and give you a call at " + response.data.phone +" You can start using your account, as soon as we finish our verification. Be sure, we'll be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: 1 (201) 992-1664",
                //imageUrl: "../plugins/images/users/avatar-student.png",
                type: "warning",   
                showCancelButton: true,   
                confirmButtonColor: "#DD6B55",   
                confirmButtonText: "Logout",   
                cancelButtonText: "Activate",
                allowEscapeKey: false,
                closeOnConfirm: false,   
                closeOnCancel: false 
            }, function(isConfirm){   
                if (isConfirm) { 
                 window.location.href = "logout";    
                } else { 
                var resendurl = "http://localhost:3000/resend/verifymail";
                var data = {
                    "universityemail":response.data.email,
                    "first_name":response.data.first_name,
                    "university":response.data.university,    
                    "cp":h,
                    "w":w          
                    };
                $http({
                   method : "POST",
                   url : resendurl,
                   data: data
                   }).then(function(response){           
                    
                      swal({   
            title: "Email sent!",   
            text: "Activation email has been resent! please kindly check your email, if you have any problems, please contact support: 1 (201) 992-1664",   
            type: "success",   
            showCancelButton: false,   
            confirmButtonColor: "#00CC66",   
            confirmButtonText: "OK",   
            cancelButtonText: "Close",   
            closeOnConfirm: true,
            allowEscapeKey: false,    
            closeOnCancel: false 
        }, function(isConfirm){   
            if (isConfirm) { 
             location.reload()    
               
            } else {     
                swal("Activation needed", "You need to activate your account before you start recruiting", "warning");   
            } 
                    
                    
            });         
                    },function onError(response) {
                  $scope.errormsg = response.statusText;
                  console.log(response.statusText)
                 //window.location.href = "500.html";
                 });  

                } 
            });  
                    

        } else if(emailinactive){
            
           swal({   
                title: "Not Activated",   
                text: "We will like to make sure that you are a university we will send an email to " + response.data.email + " and give you a call at " + response.data.phone +" You can start using your account, as soon as we finish our verification. Be sure, we'll be in touch soon, In the mean time, should you have need to speak to us or if your information is taking longer than usual to be verified, please contact support: 1 (201) 992-1664",
                //imageUrl: "../plugins/images/users/avatar-student.png",
                type: "warning",   
                showCancelButton: false,   
                confirmButtonColor: "#DD6B55",   
                confirmButtonText: "Logout",   
                cancelButtonText: "Activate",
                allowEscapeKey: false,
                closeOnConfirm: false,   
                closeOnCancel: false 
            }, function(isConfirm){   
                if (isConfirm) { 
                 window.location.href = "logout";    
                } else {  
                         
                var resendurl = "http://localhost:3000/resend/verifymail";
                var data = {
                    "universityemail":response.data.email,
                    "first_name":response.data.first_name,
                    "university":response.data.university,    
                    "cp":h,
                    "w":w          
                    };
                $http({
                   method : "POST",
                   url : resendurl,
                   data: data
                   }).then(function(response){           
                    
                      swal({   
            title: "Email sent!",   
            text: "Activation email has been resent! please kindly check your email, if you have any problems, please contact support: 1 (201) 992-1664",   
            type: "success",   
            showCancelButton: false,   
            confirmButtonColor: "#00CC66",   
            confirmButtonText: "OK",   
            cancelButtonText: "Close",   
            closeOnConfirm: true,
            allowEscapeKey: false,    
            closeOnCancel: false 
        }, function(isConfirm){   
            if (isConfirm) { 
             location.reload()    
               
            } else {     
                swal("Activation needed", "You need to activate your account before you start recruiting", "warning");   
            } 
                    
                    
            });         
                    },function onError(response) {
                  $scope.errormsg = response.statusText;
                  console.log(response.statusText)
                 //window.location.href = "500.html";
                 });    
                    
                } 
            });     
        }
           
        //IF Trial Period   
        var trial = response.data.trial;
        $scope.trial = trial;
       
        if ((trial) == true) {
        $scope.pbtn = true;
        } else {  

        //Reinitialize to default    
        var trial = response.data.trial;

        } // End Trial Plan 
            
        var role = response.data.role;  
        if ((role) == "sibadmin") {   
        $scope.admin = true;   
        } 
           
        var accountstatus = response.data.pd;   
        if ((accountstatus) == "free") {

        $("#free-upgrd-txt").html("Your Plan").removeClass('bg-info').addClass('bg-success');
        $("#startup-upgrd-txt").html("Upgrade");
        $("#prenmium-upgrd-txt").html("Upgrade");
        $("#advanced-upgrd-txt").html("Upgrade");
    
        var tableindex = $scope.index = 3;
        $scope.manageindex = 10;    
        $scope.freePlanButton = false; //hide    
        $scope.hideContact = true; //Yes //Show block
        $scope.viewContact = false; //No   
        $scope.Upgrade = true; //Show   
        $scope.downGrade = false;// Hide
        $scope.export = false; // disable
        $scope.freeplan= true;
        $scope.startuplan= false;
        $scope.prenmiumplan= false;    
        $scope.advancedplan = false;
        /* $(document).on("click", ".loadmore", function(){
             $scope.$apply(function() {
             $scope.index = tableindex + 10;
             });         
         });*/
        } else {  

        //Reinitialize to default    
        var accountstatus = response.data.pd;

        } // End Free Plan

        //Startup Plan    
        if ((accountstatus) == "startup") {
        $("#free-upgrd-txt").html("Choose");
        $("#startup-upgrd-txt").html("Your Plan").removeClass('bg-info').addClass('bg-success');;
        $("#prenmium-upgrd-txt").html("Upgrade");
        $("#advanced-upgrd-txt").html("Upgrade");    
        $scope.index = 5;
        $scope.manageindex = 500;    
        $scope.freePlanButton = true;    
        $scope.hideContact = true; //Yes    
        $scope.viewContact = false; //No
        $scope.Upgrade = true; // Show
        $scope.downGrade = false; // Hide
        $scope.export = false; // disable
        $scope.freeplan= false;
        $scope.startuplan= true;
        $scope.prenmiumplan= false;     
        $scope.advancedplan = false;

        }
        else {  
        //Reinitialize to default     
        var accountstatus = response.data.pd;

        } // End 


        // Premium Plan
        if ((accountstatus) == "prenmium") { 
        $("#prenmium-upgrd-txt").html("Your Plan").removeClass('bg-info').addClass('bg-success');
        $("#startup-upgrd-txt").html("Upgrade");
        $("#free-upgrd-txt").html("Choose");
        $("#advanced-upgrd-txt").html("Upgrade");
        $scope.index = 10;
        $scope.manageindex = 1000;     
        $scope.Upgrade = true;    
        $scope.freePlanButton = true;    
        $scope.hideContact = false; //No 
        $scope.viewContact = true;  // Yes   
        $scope.Upgrade = true; //Show   
        $scope.downGrade = false; // Hide
        $scope.export = false; // disable
        $scope.freeplan= false;
        $scope.startuplan= false;
        $scope.prenmiumplan= true;     
        $scope.advancedplan = false;      
        //$scope.$apply();    
        } else {  
        //Reinitialize to default     
        var accountstatus = response.data.pd;

        } // End 



        // Advanced Plan
        if ((accountstatus) == "advanced") { 
        //You can do all these below
        $("#advanced-upgrd-txt").html("Your Plan").removeClass('bg-info').addClass('bg-success');
        $("#startup-upgrd-txt").html("Upgrade");
        $("#free-upgrd-txt").html("Choose");
        $("#prenmium-upgrd-txt").html("Upgrade");
        var index = $scope.index = 15;     
        $scope.manageindex = 3000;    
        $scope.freePlanButton = true;  //Pricing button  
        $scope.hideContact = false; //No  
        $scope.viewContact = true; // Yes
        $scope.Upgrade = false; // Hide
        $scope.downGrade = true; // Show
        $scope.export = true; // Show
        $scope.freeplan= false;
        $scope.startuplan= false;
        $scope.prenmiumplan= false; 
        $scope.advancedplan = true;     

        } else {  
        //Reinitialize to default     
        var accountstatus = response.data.pd;

        } // End    

        },function onError(response) {
            $scope.errormsg = response.statusText;
            //window.location.href = "500.html";
        }); 


        }//End Authenticate
        
        


        //---------------END-----------------// 

       //Verify
       $scope.verifyEmail = function(){
       var useremail = $routeParams.email;
       var verificationurl = "http://localhost:3000/verify/" + useremail 
       $http({
            method : "POST",
            url : verificationurl,
            data: codeprintdata
        }).then(function(response){ 
         if ((response.data.status) == "usernotfound"){    
          swal("Oops!", "This link has expired or your account no longer exists", "error");     
        } else if (response.data.email) {    
          window.location.href = "#/verified"    
        } 

        },function onError(response) {
            $scope.errormsg = response.statusText;
            //window.location.href = "500.html";
        });  

        }
       
       //Verify
       $scope.activate = function(){
       var useremail = $routeParams.email;
       var activationurl = "http://localhost:3000/activate/" + useremail 
       $http({
            method : "POST",
            url : activationurl,
            data: codeprintdata
        }).then(function(response){ 
         if ((response.data.status) == "usernotfound"){    
          swal("Oops!", "This link has expired or your account no longer exists", "error");     
        } else if (response.data.email) { 
          window.location.href = "#/activated";    
              
        } 

        },function onError(response) {
            $scope.errormsg = response.statusText;
            console.log(response.statusText)
            //window.location.href = "500.html";
        });  

        }

       //Verify
       $scope.unsub = function(){
       var useremail = $routeParams.email;
       var uid = $routeParams.id;       
       var unsuburl = "http://localhost:3000/university/unsubscribe/" + useremail +"/" + uid
       $http({
            method : "POST",
            url : unsuburl,
            data: codeprintdata
        }).then(function(response){ 
            
          window.location.href = "#/email/unsubscribed";    

        },function onError(response) {
            $scope.errormsg = response.statusText;
            console.log(response.statusText)
            //window.location.href = "500.html";
        });  

        }
       
       
       $scope.rp = function(){       
       var useremail = $("#rp").val();
       var rpurl = "http://localhost:3000/reset"
       var data = { "useremail": useremail, "w": w, "cp": h }

        $http({
            method : "POST",
            url : rpurl,
            data: data
        }).then(function(response){ 

         if ((response.data.status) == "usernotfound"){    
        swal("Oops!", "We could not find the user with this email address", "error");     
        } else if (response.data.email) {    
        swal("Email Sent", "Password instructions has been sent to the email address: " + response.data.email, "success");    
        } 

        },function onError(response) {
            //console.log(response)
            $scope.errormsg = response.statusText;
            //window.location.href = "500.html";
        });  


        }

       //Get students
       $scope.getStudents = function (){
            $http({
            method : "POST",
            url : "http://localhost:3000/allstudents",
            data: codeprintdata
            }).then(function(response){
            $("#ntn-nw").hide();
            $(".n-aplctn-fd").hide();
            $scope.tblhead = true; //Angularize   
            $scope.students = response.data;
            var studentsCountry = response.data;    
            var appliedstudents = $scope.aplctnrcvd = response.data.length;     
            //var appliedstudents = $scope.aplctnrcvd = 1000000;// For testing max numbers    
            if (appliedstudents >= 999999){
              $scope.aplctnrcvd = "1M+";
              //.substring(0, 5) + "-"  //For ... replacement   
            }
                
         
                    
        $scope.notification = "Student application recieved";
            
            //console.log(response.data);
           /* angular.forEach(response.data, function(value, key) {
            var newDate = JSON.stringify(value.create_date)
            var dateStr = JSON.parse(newDate); //Convert to JS date object
            //console.log(dateStr); // 2014-01-01T23:28:56.782Z
            //Convert the date to Normal readable date
            var date = Date(dateStr); //use JS object to convert
            //console.log(date); 
             }); *///End Each
            var noOfAustria=0;
            var noOfAzerbaijan=0;
            var noOfAustralia=0;
            var noOfArgentina=0;
            var noOfAntiguaandBarbuda=0;
            var noOfAngola=0;
            var noOfAndorra=0;
            var noOfAlgeria=0;
            var noOfAlbania=0;
            var noOfAfghanistan=0;
            var noOfBahamas=0;
            var noOfBahrain=0;
            var noOfBangladesh=0;
            var noOfBarbados=0;
            var noOfBelarus=0;
            var noOfBelgium=0;
            var noOfBelize=0;
            var noOfBenin=0;
            var noOfBhutan=0;
            var noOfBolivia=0;
            var noOfBosnia=0;
            var noOfBotswana=0;
            var noOfBrazil=0;
            var noOfBrunei=0;
            var noOfBurkinaFaso=0;
            var noOfBurundi=0;
            var noOfCaboVerde=0;
            var noOfCambodia=0;
            var noOfCameroon=0;
            var noOfCanada=0;
            var noOfCentralAfrican=0;
            var noOfChad=0;
            var noOfChile=0;
            var noOfChina=0;
            var noOfColombia=0;
            var noOfComoros=0;
            var noOfCongoDRC=0;
            var noOfCongo=0;
            var noOfCostaRica=0;
            var noOfCotedIvoire=0;
            var noOfCroatia=0;
            var noOfCuba=0;
            var noOfCyprus=0;
            var noOfCzech=0;
            var noOfDenmark=0;
            var noOfDjibouti=0;
            var noOfDominica=0;
            var noOfEcuador=0;
            var noOfEgypt=0;
            var noOfElSalvador=0;
            var noOfEQGuinea=0;
            var noOfEritrea=0;
            var noOfEstonia=0;
            var noOfEthiopia=0;
            var noOfFiji=0;
            var noOfFinland=0;
            var noOfFrance=0;
            var noOfGabon=0;
            var noOfGambia=0;
            var noOfGeorgia=0;
            var noOfGermany=0;
            var noOfGhana=0;
            var noOfGreece=0;
            var noOfGrenada=0;
            var noOfGuatemala=0;
            var noOfGuinea=0;
            var noOfGuineaBissau=0;
            var noOfGuyana=0;
            var noOfHaiti=0;
            var noOfHonduras=0;
            var noOfHungary=0;
            var noOfIceland=0;
            var noOfIndia=0;
            var noOfIndonesia=0;
            var noOfIran=0;
            var noOfIraq=0;
            var noOfIreland=0;
            var noOfIsrael=0;
            var noOfItaly=0;
            var noOfJamaica=0;
            var noOfJapan=0;
            var noOfJordan=0;
            var noOfKazakhstan=0;
            var noOfKenya=0; 
            var noOfKiribati=0; 
            var noOfKosovo=0;
            var noOfKuwait=0;
            var noOfKyrgyzstan=0; 
            var noOfLaos=0;
            var noOfLatvia=0;
            var noOfLebanon=0;
            var noOfLesotho=0;
            var noOfLiberia=0;
            var noOfLibya=0;
            var noOfLiechtenstein=0;
            var noOfLithuania=0; 
            var noOfLuxembourg=0; 
            var noOfMacedonia=0;
            var noOfMadagascar=0;
            var noOfMalawi=0;
            var noOfMalaysia=0;
            var noOfMaldives=0;
            var noOfMali=0;
            var noOfMalta=0;
            var noOfMarshallIslands=0; 
            var noOfMauritania=0;     
            var noOfMauritius=0; 
            var noOfMicronesia=0;
            var noOfMoldova=0;
            var noOfMonaco=0;
            var noOfMongolia=0;
            var noOfMontenegro=0;
            var noOfMorocco=0;
            var noOfMozambique=0; 
            var noOfMyanmar=0;
            var noOfNamibia=0;
            var noOfNauru=0;
            var noOfNepal=0;
            var noOfNetherlands=0;
            var noOfNewZealand=0;
            var noOfNicaragua=0; 
            var noOfNiger=0;
            var noOfNigeria=0;
            var noOfNorthKorea=0; 
            var noOfNorway=0;
            var noOfOman=0;
            var noOfPakistan=0;
            var noOfPalau=0; 
            var noOfPalestine=0;
            var noOfPanama=0;
            var noOfPapuaNG=0; 
            var noOfParaguay=0;
            var noOfPeru=0;
            var noOfPhilippines=0;
            var noOfPoland=0;
            var noOfPortugal=0;
            var noOfQatar=0;
            var noOfRomania=0;
            var noOfRussia=0; 
            var noOfRwanda=0;
            var noOfSaintKitts=0;     
            var noOfSaintLucia=0;
            var noOfSaintVincent=0;
            var noOfSamoa=0; 
            var noOfSanMarino=0;
            var noOfSaoTome=0;
            var noOfSaudiArabia=0;
            var noOfSenegal=0;
            var noOfSerbia=0; 
            var noOfSeychelles=0;
            var noOfSierraLeone=0; 
            var noOfSingapore=0;
            var noOfSlovakia=0;
            var noOfSlovenia=0;
            var noOfSolomonIslands=0; 
            var noOfSomalia=0;
            var noOfSouthAfrica=0;
            var noOfSouthKorea=0; 
            var noOfSouthSudan=0; 
            var noOfSpain=0;
            var noOfSriLanka=0;
            var noOfSudan=0;
            var noOfSuriname=0; 
            var noOfSwaziland=0; 
            var noOfSweden=0;
            var noOfSwitzerland=0; 
            var noOfSyria=0;
            var noOfTaiwan=0; 
            var noOfTajikistan=0; 
            var noOfTanzania=0; 
            var noOfThailand=0; 
            var noOfTimorLeste=0; 
            var noOfTogo=0; 
            var noOfTonga=0;
            var noOfTrinidad=0; 
            var noOfTunisia=0; 
            var noOfTurkey=0; 
            var noOfTurkmenistan=0; 
            var noOfTuvalu=0;
            var noOfUganda=0;
            var noOfUkraine=0; 
            var noOfUAE=0;
            var noOfUK=0; 
            var noOfUnitedStates=0; 
            var noOfUruguay=0; 
            var noOfUzbekistan=0;
            var noOfVanuatu=0;
            var noOfVatican=0;
            var noOfVenezuela=0;
            var noOfVietnam=0;
            var noOfYemen=0;
            var noOfZambia=0;
            var noOfZimbabwe=0;      
            var nigerianStudentsCnt = 0;
            var UkCnt = 0;    
                
            for (i = 0; i < studentsCountry.length; i++) { 
               var countryOfStudent = studentsCountry[i].country; 
                
            if (countryOfStudent == "Nigeria"){
                nigerianStudentsCnt += 1;   
               } 
                
            if (countryOfStudent == "United kingdom"){
                  UkCnt += 1;
              }  
                    
            if (countryOfStudent =="Austria"){
                   noOfAustria += 1;
              } 
            if (countryOfStudent =="Azerbaijan"){
                  noOfAzerbaijan += 1;
              } 
            if (countryOfStudent =="Australia"){
                   noOfAustralia += 1;
            
              } 
            if (countryOfStudent =="Argentina"){
                  noOfArgentina += 1;
            
              } 
            if (countryOfStudent =="Antigua and Barbuda"){
                  noOfAntiguaandBarbuda += 1;
            
              } 
            if (countryOfStudent =="Angola"){
                  noOfAngola += 1;
            
              } 
            if (countryOfStudent =="Andorra"){
                  noOfAndorra += 1;
            
              } 
            if (countryOfStudent =="Algeria"){
                  noOfAlgeria += 1;
           
              } 
            if (countryOfStudent =="Albania"){
                   noOfAlbania += 1;
           
              } 
            if (countryOfStudent =="Afghanistan"){
                   noOfAfghanistan += 1;
            
              } 
            if (countryOfStudent =="Bahamas"){
                  noOfBahamas += 1;
            
              } 
            if (countryOfStudent =="Bahrain"){
                  noOfBahrain += 1;
            
              } 
            if (countryOfStudent =="Bangladesh"){
                  noOfBangladesh += 1;
            
              } 
            if (countryOfStudent =="Barbados"){
                  noOfBarbados += 1;
       
              } 
            if (countryOfStudent =="Belarus"){
                       noOfBelarus += 1;
        
              } 
            if (countryOfStudent =="Belgium"){
                      noOfBelgium += 1;
           
              } 
            if (countryOfStudent =="Belize"){
                   noOfBelize += 1;
       
              } 
            if (countryOfStudent =="Benin"){
                       noOfBenin += 1;
           
              } 
            if (countryOfStudent =="Bhutan"){
                   noOfBhutan += 1;
           
              } 
            if (countryOfStudent =="Bolivia"){
                   noOfBolivia += 1;
         
              } 
            if (countryOfStudent =="Bosnia"){
                     noOfBosnia += 1;
            
              } 
            if (countryOfStudent =="Botswana"){
                  noOfBotswana += 1;
          
              } 
            if (countryOfStudent =="Brazil"){
                    noOfBrazil += 1;
         
              } 
            if (countryOfStudent =="Brunei"){
                     noOfBrunei += 1;
          
              } 
            if (countryOfStudent =="Burkina Faso"){
                    noOfBurkinaFaso += 1;
         
              } 
            if (countryOfStudent =="Burundi"){
                     noOfBurundi += 1;
           
              } 
            if (countryOfStudent =="Cabo Verde"){
                   noOfCaboVerde += 1;
         
              } 
            if (countryOfStudent =="Cambodia"){
                     noOfCambodia += 1;
            
              } 
            if (countryOfStudent =="Cameroon"){
                  noOfCameroon += 1;
       
              } 
            if (countryOfStudent =="Canada"){
                       noOfCanada += 1;
          
              } 
            if (countryOfStudent =="Central African"){
                    noOfCentralAfrican += 1;
          
              } 
            if (countryOfStudent =="Chad"){
                    noOfChad += 1;
         
              } 
            if (countryOfStudent =="Chile"){
                     noOfChile += 1;
         
              } 
            if (countryOfStudent =="China"){
                     noOfChina += 1;
            
              } 
            if (countryOfStudent =="Colombia"){
                  noOfColombia += 1;
          
              } 
            if (countryOfStudent =="Comoros"){
                    noOfComoros += 1;
            
              } 
            if (countryOfStudent =="Congo DRC"){
                  noOfCongoDRC += 1;
          
              } 
            if (countryOfStudent =="Congo"){
                    noOfCongo += 1;
           
              } 
            if (countryOfStudent =="Costa Rica"){
                   noOfCostaRica += 1;
            
              } 
            if (countryOfStudent =="Cote d'Ivoire"){
                 noOfCotedIvoire += 1;
           
              } 
            if (countryOfStudent =="Croatia"){
                   noOfCroatia += 1;
          
              } 
            if (countryOfStudent =="Cuba"){
                    noOfCuba += 1;
           
              } 
            if (countryOfStudent =="Cyprus"){
                   noOfCyprus += 1;
           
              } 
            if (countryOfStudent =="Czech"){
                   noOfCzech += 1;
           
              } 
            if (countryOfStudent =="Denmark"){
                   noOfDenmark += 1;
            
              } 
            if (countryOfStudent =="Djibouti"){
                  noOfDjibouti += 1;
            
              } 
            if (countryOfStudent =="Dominica"){
                  noOfDominica += 1;
           
              } 
            if (countryOfStudent =="Ecuador"){
                   noOfEcuador += 1;
              } 
            if (countryOfStudent =="Egypt"){
                  noOfEgypt += 1;
            
              } 
            if (countryOfStudent =="El Salvador"){
                  noOfElSalvador += 1;
            
              } 
            if (countryOfStudent =="EQ Guinea"){
                  noOfEQGuinea += 1;
            
              } 
            if (countryOfStudent =="Eritrea"){
                  noOfEritrea += 1;
            
              } 
            if (countryOfStudent =="Estonia"){
                  noOfEstonia += 1;
           
              } 
            if (countryOfStudent =="Ethiopia"){
                   noOfEthiopia += 1;
            
              } 
            if (countryOfStudent =="Fiji"){
                  noOfFiji += 1;
            
              } 
            if (countryOfStudent =="Finland"){
                  noOfFinland += 1;
            
              } 
            if (countryOfStudent =="France"){
                  noOfFrance += 1;
            
              } 
            if (countryOfStudent =="Gabon"){
                  noOfGabon += 1;
            
              } 
            if (countryOfStudent =="Gambia"){
                  noOfGambia += 1;
            
              } 
            if (countryOfStudent =="Georgia"){
                  noOfGeorgia += 1;
            
              } 
            if (countryOfStudent =="Germany"){
                 noOfGermany += 1;
           
              } 
            if (countryOfStudent =="Ghana"){
                   noOfGhana += 1;
            
              } 
            if (countryOfStudent =="Greece"){
                  noOfGreece += 1;
            
              } 
            if (countryOfStudent =="Grenada"){
                  noOfGrenada += 1;
            
              } 
            if (countryOfStudent =="Guatemala"){
                  noOfGuatemala += 1;
            
              } 
            if (countryOfStudent =="Guinea"){
                  noOfGuinea += 1;
           
              } 
            if (countryOfStudent =="Guinea Bissau"){
                   noOfGuineaBissau += 1;
            
              } 
            if (countryOfStudent =="Guyana"){
                  noOfGuyana += 1;
           
              } 
            if (countryOfStudent =="Haiti"){
                  noOfHaiti += 1;
           
              } 
            if (countryOfStudent =="Honduras"){
                   noOfHonduras += 1;
           
              } 
            if (countryOfStudent =="Hungary"){
                   noOfHungary += 1;
            
              } 
            if (countryOfStudent =="Iceland"){
                  noOfIceland += 1;
            
              } 
            if (countryOfStudent =="India"){
                  noOfIndia += 1;
                  console.log("Number of Students from India is:" + noOfIndia)
            
              } 
            if (countryOfStudent =="Indonesia"){
                  noOfIndonesia += 1;
            
              } 
            if (countryOfStudent =="Iran"){
                  noOfIran += 1;
            
              } 
            if (countryOfStudent =="Iraq"){
                  noOfIraq += 1;
           
              } 
            if (countryOfStudent =="Ireland"){
                   noOfIreland += 1;
            
              } 
            if (countryOfStudent =="Israel"){
                  noOfIsrael += 1;
            
              } 
            if (countryOfStudent =="Italy"){
                  noOfItaly += 1;
            
              } 
            if (countryOfStudent =="Jamaica"){
                  noOfJamaica += 1;
            
              } 
            if (countryOfStudent =="Japan"){
                  noOfJapan += 1;
            
              } 
            if (countryOfStudent =="Jordan"){
                  noOfJordan += 1;
            
              } 
            if (countryOfStudent =="Kazakhstan"){
                  noOfKazakhstan += 1;
            
              } 
            if (countryOfStudent =="Kenya"){
                  noOfKenya += 1; 
            
              }  
            if (countryOfStudent =="Kiribati"){
                  noOfKiribati += 1; 
            
              }  
            if (countryOfStudent =="Kosovo"){
                  noOfKosovo += 1;
            
              } 
            if (countryOfStudent =="Kuwait"){
                  noOfKuwait += 1;
            
              } 
            if (countryOfStudent =="Kyrgyzstan"){
                  noOfKyrgyzstan += 1; 
            
              }  
            if (countryOfStudent =="Laos"){
                  noOfLaos += 1;
            
              } 
            if (countryOfStudent =="Latvia"){
                  noOfLatvia += 1;
            
              }  
            if (countryOfStudent =="Lebanon"){
                  noOfLebanon += 1;
            
              } 
            if (countryOfStudent =="Lesotho"){
                  noOfLesotho += 1;
            
              } 
            if (countryOfStudent =="Liberia"){
                  noOfLiberia += 1;
            
              } 
            if (countryOfStudent =="Libya"){
                 noOfLibya += 1;
            
              } 
            if (countryOfStudent =="Liechtenstein"){
                 noOfLiechtenstein += 1;
            
              } 
            if (countryOfStudent =="Lithuania"){
                 noOfLithuania += 1; 
            
              }  
            if (countryOfStudent =="Luxembourg"){
                 noOfLuxembourg += 1; 
            
              }  
            if (countryOfStudent =="Macedonia"){
                  noOfMacedonia += 1;
            
              } 
            if (countryOfStudent =="Madagascar"){
                  noOfMadagascar += 1;
              } 
            if (countryOfStudent =="Malawi"){
                  noOfMalawi += 1;
          
              } 
            if (countryOfStudent =="Malaysia"){
                    noOfMalaysia += 1;
          
              } 
            if (countryOfStudent =="Maldives"){
                     noOfMaldives += 1;
       
              } 
            if (countryOfStudent =="Mali"){
                       noOfMali += 1;
         
              } 
            if (countryOfStudent =="Malta"){
                     noOfMalta += 1;
            
              } 
            if (countryOfStudent =="Marshall Islands"){
                 noOfMarshallIslands += 1; 
        
              }  
            if (countryOfStudent =="Mauritania"){
                     noOfMauritania += 1;     
          
              }      
            if (countryOfStudent =="Mauritius"){
                    noOfMauritius += 1; 
           
              }  
            if (countryOfStudent =="Micronesia"){
                   noOfMicronesia += 1;
         
              } 
            if (countryOfStudent =="Moldova"){
                     noOfMoldova += 1;
            
              } 
            if (countryOfStudent =="Monaco"){
                  noOfMonaco += 1;
          
              } 
            if (countryOfStudent =="Mongolia"){
                    noOfMongolia += 1;
          
              } 
            if (countryOfStudent =="Montenegro"){
                    noOfMontenegro += 1;
          
              } 
            if (countryOfStudent =="Morocco"){
                    noOfMorocco += 1;
          
              } 
            if (countryOfStudent =="Mozambique"){
                    noOfMozambique += 1; 
          
              }  
            if (countryOfStudent =="Myanmar"){
                   noOfMyanmar += 1;
            
              } 
            if (countryOfStudent =="Namibia"){
                  noOfNamibia += 1;
          
              } 
            if (countryOfStudent =="Nauru"){
                    noOfNauru += 1;
            
              }  
            if (countryOfStudent =="Nepal"){
                  noOfNepal += 1;
            
              } 
            if (countryOfStudent =="Netherlands"){
                 noOfNetherlands += 1;
           
              } 
            if (countryOfStudent =="New Zealand"){
                   noOfNewZealand += 1;
         
              } 
            if (countryOfStudent =="Nicaragua"){
                     noOfNicaragua += 1; 
         
              }  
            if (countryOfStudent =="Niger"){
                     noOfNiger += 1;
           
              } 
            if (countryOfStudent =="Nigeria"){
                   noOfNigeria += 1;
            
              } 
            if (countryOfStudent =="North Korea"){
                  noOfNorthKorea += 1; 
            
              }  
            if (countryOfStudent =="Norway"){
                  noOfNorway += 1;
            
              } 
            if (countryOfStudent =="Oman"){
                  noOfOman += 1;
            
              } 
            if (countryOfStudent =="Pakistan"){
                  noOfPakistan += 1;
            
              } 
            if (countryOfStudent =="Palau"){
                  noOfPalau += 1;
              }  
            if (countryOfStudent =="Palestine"){
                  noOfPalestine += 1;
          
              } 
            if (countryOfStudent =="Panama"){
                    noOfPanama += 1;
           
              } 
            if (countryOfStudent =="Papua NG"){
                   noOfPapuaNG += 1; 
    
              }  
            if (countryOfStudent =="Paraguay"){
                   noOfParaguay += 1;
           
              } 
            if (countryOfStudent =="Peru"){
                   noOfPeru += 1;
            
              } 
            if (countryOfStudent =="Philippines"){
                  noOfPhilippines += 1;
           
              } 
            if (countryOfStudent =="Poland"){
                   noOfPoland += 1;
           
              } 
            if (countryOfStudent =="Portugal"){
                   noOfPortugal += 1;
           
              } 
            if (countryOfStudent =="Qatar"){
                   noOfQatar += 1;
           
              } 
            if (countryOfStudent =="Romania"){
                   noOfRomania += 1;
          
              } 
            if (countryOfStudent =="Russia"){
                    noOfRussia += 1; 
            
              }  
            if (countryOfStudent =="Rwanda"){
                  noOfRwanda += 1;
          
              }  
            if (countryOfStudent =="Saint Kitts"){
                    noOfSaintKitts += 1;     
            
              }      
            if (countryOfStudent =="Saint Lucia"){
                  noOfSaintLucia += 1;
         
              } 
            if (countryOfStudent =="Saint Vincent"){
                     noOfSaintVincent += 1;
          
              } 
            if (countryOfStudent =="Samoa"){
                    noOfSamoa += 1; 
            
              }  
            if (countryOfStudent =="San Marino"){
                  noOfSanMarino += 1;
           
              }  
            if (countryOfStudent =="Sao Tome"){
                   noOfSaoTome += 1;
            
              } 
            if (countryOfStudent =="Saudi Arabia"){
                  noOfSaudiArabia += 1;
            
              } 
            if (countryOfStudent =="Senegal"){
                  noOfSenegal += 1;
            
              } 
            if (countryOfStudent =="Serbia"){
                  noOfSerbia += 1; 
            
              }  
            if (countryOfStudent =="Seychelles"){
                  noOfSeychelles += 1;
            
              } 
            if (countryOfStudent =="Sierra Leone"){
                 noOfSierraLeone += 1; 
            
              }  
            if (countryOfStudent =="Singapore"){
                  noOfSingapore += 1;
           
              } 
            if (countryOfStudent =="Slovakia"){
                   noOfSlovakia += 1;
            
              } 
            if (countryOfStudent ="Slovenia"){
                  noOfSlovenia += 1;
            
              } 
            if (countryOfStudent =="Solomon Islands"){
                  noOfSolomonIslands += 1; 
           
              }  
            if (countryOfStudent =="Somalia"){
                   noOfSomalia += 1;
            
              }  
            if (countryOfStudent =="South Africa"){
                  noOfSouthAfrica += 1;
            
              } 
            if (countryOfStudent =="South Korea"){
                  noOfSouthKorea += 1; 
           
              }  
            if (countryOfStudent =="South Sudan"){
                   noOfSouthSudan += 1; 
           
              }  
            if (countryOfStudent =="Spain"){
                   noOfSpain += 1;
            
              }  
            if (countryOfStudent =="Sri Lanka"){
                  noOfSriLanka += 1;
              } 
            if (countryOfStudent =="Sudan"){
                  noOfSudan += 1;
    
              } 
            if (countryOfStudent =="Suriname"){
                          noOfSuriname += 1; 
      
              }  
            if (countryOfStudent =="Swaziland"){
                        noOfSwaziland += 1; 
       
              }  
            if (countryOfStudent =="Sweden"){
                       noOfSweden += 1;
            
              } 
            if (countryOfStudent =="Switzerland"){
                  noOfSwitzerland += 1; 
        
              }  
            if (countryOfStudent =="Syria"){
                      noOfSyria += 1;
          
              } 
            if (countryOfStudent =="Taiwan"){
                    noOfTaiwan += 1; 
         
              }  
            if (countryOfStudent =="Tajikistan"){
                     noOfTajikistan += 1; 
         
              }  
            if (countryOfStudent =="Tanzania"){
                     noOfTanzania += 1; 
            
              }  
            if (countryOfStudent =="Thailand"){
                  noOfThailand += 1; 
         
              }  
            if (countryOfStudent =="Timor-Leste"){
                     noOfTimorLeste += 1; 
         
              }  
            if (countryOfStudent =="Togo"){
                     noOfTogo += 1; 
           
              }  
            if (countryOfStudent =="Tonga"){
                   noOfTonga += 1;
            
              } 
            if (countryOfStudent =="Trinidad"){
                  noOfTrinidad += 1; 
            
              }  
            if (countryOfStudent =="Tunisia"){
                  noOfTunisia += 1; 
            
              }  
            if (countryOfStudent =="Turkey"){
                  noOfTurkey += 1; 
           
              }  
            if (countryOfStudent =="Turkmenistan"){
                   noOfTurkmenistan += 1; 
           
              }  
            if (countryOfStudent =="Tuvalu"){
                   noOfTuvalu += 1;
          
              } 
            if (countryOfStudent =="Uganda"){
                    noOfUganda += 1;
            
              } 
            if (countryOfStudent =="Ukraine"){
                  noOfUkraine += 1; 
         
              }  
            if (countryOfStudent =="UAE"){
                     noOfUAE += 1;
            
              } 
            if (countryOfStudent =="UK"){
                  noOfUK += 1; 
            
              }  
            if (countryOfStudent =="United States"){
                  noOfUnitedStates += 1; 
          
              }  
            if (countryOfStudent =="Uruguay"){
                    noOfUruguay += 1; 
         
              }  
            if (countryOfStudent =="Uzbekistan"){
                     noOfUzbekistan += 1;
           
              } 
            if (countryOfStudent =="Vanuatu"){
                   noOfVanuatu += 1;
           
              } 
            if (countryOfStudent =="Vatican"){
                   noOfVatican += 1;
            
              } 
            if (countryOfStudent =="Venezuela"){
                  noOfVenezuela += 1;
            
              } 
            if (countryOfStudent =="Vietnam"){
                  noOfVietnam += 1;
                
              } 
            if (countryOfStudent =="Yemen"){
                  noOfYemen += 1;
            
              } 
            if (countryOfStudent =="Zambia"){
                  noOfZambia += 1;
            
              } 
            if (countryOfStudent =="Zimbabwe"){
                  noOfZimbabwe += 1;
              }     
                
              }          
            $scope.nigeria = (nigerianStudentsCnt);
            $scope.england = (UkCnt);
            $scope.noOfAustria=noOfAustria;
            $scope.noOfAzerbaijan=noOfAzerbaijan;
            $scope.noOfAustralia=noOfAustralia;
            $scope.noOfArgentina=noOfArgentina;
            $scope.noOfAntiguaandBarbuda=noOfAntiguaandBarbuda;
            $scope.noOfAngola=noOfAngola;
            $scope.noOfAndorra=noOfAndorra;
            $scope.noOfAlgeria=noOfAlgeria;
            $scope.noOfAlbania=noOfAlbania;
            $scope.noOfAfghanistan=noOfAfghanistan;
            $scope.noOfBahamas=noOfBahamas;
            $scope.noOfBahrain=noOfBahrain;
            $scope.noOfBangladesh=noOfBangladesh;
            $scope.noOfBarbados=noOfBarbados;
            $scope.noOfBelarus=noOfBelarus;
            $scope.noOfBelgium=noOfBelgium;
            $scope.noOfBelize=noOfBelize;
            $scope.noOfBenin=noOfBenin;
            $scope.noOfBhutan=noOfBhutan;
            $scope.noOfBolivia=noOfBolivia;
            $scope.noOfBosnia=noOfBosnia;
            $scope.noOfBotswana=noOfBotswana;
            $scope.noOfBrazil=noOfBrazil;
            $scope.noOfBrunei=noOfBrunei;
            $scope.noOfBurkinaFaso=noOfBurkinaFaso;
            $scope.noOfBurundi=noOfBurkinaFaso;
            $scope.noOfCaboVerde=noOfCaboVerde;
            $scope.noOfCambodia=noOfCambodia;
            $scope.noOfCameroon=noOfCameroon;
            $scope.noOfCanada=noOfCanada;
            $scope.noOfCentralAfrican=noOfCentralAfrican;
            $scope.noOfChad=noOfChad;
            $scope.noOfChile=noOfChile;
            $scope.noOfChina=noOfChina;
            $scope.noOfColombia=noOfColombia;
            $scope.noOfComoros=noOfComoros;
            $scope.noOfCongoDRC=noOfCongoDRC;
            $scope.noOfCongo=noOfCongo;
            $scope.noOfCostaRica=noOfCostaRica;
            $scope.noOfCotedIvoire=noOfCotedIvoire;
            $scope.noOfCroatia=noOfCroatia;
            $scope.noOfCuba=noOfCuba;
            $scope.noOfCyprus=noOfCyprus;
            $scope.noOfCzech=noOfCzech;
            $scope.noOfDenmark=noOfDenmark;
            $scope.noOfDjibouti=noOfDjibouti;
            $scope.noOfDominica=noOfDominica;
            $scope.noOfEcuador=noOfEcuador;
            $scope.noOfEgypt=noOfEgypt;
            $scope.noOfElSalvador=noOfElSalvador;
            $scope.noOfEQGuinea=noOfEQGuinea;
            $scope.noOfEritrea=noOfEritrea;
            $scope.noOfEstonia=noOfEstonia;
            $scope.noOfEthiopia=noOfEthiopia;
            $scope.noOfFiji=noOfFiji;
            $scope.noOfFinland=noOfFinland;
            $scope.noOfFrance=noOfFrance;
            $scope.noOfGabon=noOfGabon;
            $scope.noOfGambia=noOfGambia;
            $scope.noOfGeorgia=noOfGeorgia;
            $scope.noOfGermany=noOfGermany;
            $scope.noOfGhana=noOfGhana;
            $scope.noOfGreece=noOfGreece;
            $scope.noOfGrenada=noOfGrenada;
            $scope.noOfGuatemala=noOfGuatemala;
            $scope.noOfGuinea=noOfGuinea;
            $scope.noOfGuineaBissau=noOfGuineaBissau;
            $scope.noOfGuyana=noOfGuyana;
            $scope.noOfHaiti=noOfHaiti;
            $scope.noOfHonduras=noOfHonduras;
            $scope.noOfHungary=noOfHungary;
            $scope.noOfIceland=noOfIceland;
            $scope.noOfIndia=noOfIndia;
            $scope.noOfIndonesia=noOfIndonesia;
            $scope.noOfIran=noOfIran;
            $scope.noOfIraq=noOfIraq;
            $scope.noOfIreland=noOfIreland;
            $scope.noOfIsrael=noOfIsrael;
            $scope.noOfItaly=noOfItaly;
            $scope.noOfJamaica=noOfJamaica;
            $scope.noOfJapan=noOfJapan;
            $scope.noOfJordan=noOfJordan;
            $scope.noOfKazakhstan=noOfKazakhstan;
            $scope.noOfKenya=noOfKenya; 
            $scope.noOfKiribati=noOfKiribati; 
            $scope.noOfKosovo=noOfKosovo;
            $scope.noOfKuwait=noOfKuwait;
            $scope.noOfKyrgyzstan=noOfKyrgyzstan; 
            $scope.noOfLaos=noOfLaos;
            $scope.noOfLatvia=noOfLatvia;
            $scope.noOfLebanon=noOfLebanon;
            $scope.noOfLesotho=noOfLesotho;
            $scope.noOfLiberia=noOfLiberia;
            $scope.noOfLibya=noOfLibya;
            $scope.noOfLiechtenstein=noOfLiechtenstein;
            $scope.noOfLithuania=noOfLithuania; 
            $scope.noOfLuxembourg=noOfLuxembourg; 
            $scope.noOfMacedonia=noOfMacedonia;
            $scope.noOfMadagascar=noOfMadagascar;
            $scope.noOfMalawi=noOfMalawi;
            $scope.noOfMalaysia=noOfMalaysia;
            $scope.noOfMaldives=noOfMaldives;
            $scope.noOfMali=noOfMali;
            $scope.noOfMalta=noOfMalta;
            $scope.noOfMarshallIslands=noOfMarshallIslands; 
            $scope.noOfMauritania=noOfMauritania;     
            $scope.noOfMauritius=noOfMauritius; 
            $scope.noOfMicronesia=noOfMicronesia;
            $scope.noOfMoldova=noOfMoldova;
            $scope.noOfMonaco=noOfMonaco;
            $scope.noOfMongolia=noOfMongolia;
            $scope.noOfMontenegro=noOfMontenegro;
            $scope.noOfMorocco=noOfMorocco;
            $scope.noOfMozambique=noOfMozambique; 
            $scope.noOfMyanmar=noOfMyanmar;
            $scope.noOfNamibia=noOfNamibia;
            $scope.noOfNauru=noOfNauru;
            $scope.noOfNepal=noOfNepal;
            $scope.noOfNetherlands=noOfNetherlands;
            $scope.noOfNewZealand=noOfNewZealand;
            $scope.noOfNicaragua=noOfNicaragua; 
            $scope.noOfNiger=noOfNiger;
            $scope.noOfNigeria=noOfNigeria;
            $scope.noOfNorthKorea=noOfNorthKorea; 
            $scope.noOfNorway=noOfNorway;
            $scope.noOfOman=noOfOman;
            $scope.noOfPakistan=noOfPakistan;
            $scope.noOfPalau=noOfPalau; 
            $scope.noOfPalestine=noOfPalestine;
            $scope.noOfPanama=noOfPanama;
            $scope.noOfPapuaNG=noOfPapuaNG; 
            $scope.noOfParaguay=noOfParaguay;
            $scope.noOfPeru=noOfPeru;
            $scope.noOfPhilippines=noOfPhilippines;
            $scope.noOfPoland=noOfPoland;
            $scope.noOfPortugal=noOfPortugal;
            $scope.noOfQatar=noOfQatar;
            $scope.noOfRomania=noOfRomania;
            $scope.noOfRussia=noOfRussia; 
            $scope.noOfRwanda=noOfRwanda;
            $scope.noOfSaintKitts=noOfSaintKitts;     
            $scope.noOfSaintLucia=noOfSaintLucia;
            $scope.noOfSaintVincent=noOfSaintVincent;
            $scope.noOfSamoa=noOfSamoa; 
            $scope.noOfSanMarino=noOfSanMarino;
            $scope.noOfSaoTome=noOfSaoTome;
            $scope.noOfSaudiArabia=noOfSaudiArabia;
            $scope.noOfSenegal=noOfSenegal;
            $scope.noOfSerbia=noOfSerbia; 
            $scope.noOfSeychelles=noOfSeychelles;
            $scope.noOfSierraLeone=noOfSierraLeone; 
            $scope.noOfSingapore=noOfSingapore;
            $scope.noOfSlovakia=noOfSlovakia;
            $scope.noOfSlovenia=noOfSlovenia;
            $scope.noOfSolomonIslands=noOfSolomonIslands; 
            $scope.noOfSomalia=noOfSomalia;
            $scope.noOfSouthAfrica=noOfSouthAfrica;
            $scope.noOfSouthKorea=noOfSouthKorea; 
            $scope.noOfSouthSudan=noOfSouthSudan; 
            $scope.noOfSpain=noOfSpain;
            $scope.noOfSriLanka=noOfSriLanka;
            $scope.noOfSudan=noOfSudan;
            $scope.noOfSuriname=noOfSuriname; 
            $scope.noOfSwaziland=noOfSwaziland; 
            $scope.noOfSweden=noOfSweden;
            $scope.noOfSwitzerland=noOfSwitzerland; 
            $scope.noOfSyria=noOfSyria;
            $scope.noOfTaiwan=noOfTaiwan; 
            $scope.noOfTajikistan=noOfTajikistan; 
            $scope.noOfTanzania=noOfTanzania; 
            $scope.noOfThailand=noOfThailand; 
            $scope.noOfTimorLeste=noOfTimorLeste; 
            $scope.noOfTogo=noOfTogo; 
            $scope.noOfTonga=noOfTonga;
            $scope.noOfTrinidad=noOfTrinidad; 
            $scope.noOfTunisia=noOfTunisia; 
            $scope.noOfTurkey=noOfTurkey; 
            $scope.noOfTurkmenistan=noOfTurkmenistan; 
            $scope.noOfTuvalu=noOfTuvalu;
            $scope.noOfUganda=noOfUganda;
            $scope.noOfUkraine=noOfUkraine; 
            $scope.noOfUAE=noOfUAE;
            $scope.noOfUK=noOfUK; 
            $scope.noOfUnitedStates=noOfUnitedStates; 
            $scope.noOfUruguay=noOfUruguay; 
            $scope.noOfUzbekistan=noOfUzbekistan;
            $scope.noOfVanuatu=noOfVanuatu;
            $scope.noOfVatican=noOfVatican;
            $scope.noOfVenezuela=noOfVenezuela;
            $scope.noOfVietnam=noOfVietnam;
            $scope.noOfYemen=noOfYemen;
            $scope.noOfZambia=noOfZambia;
            $scope.noOfZimbabwe=noOfZimbabwe;        
        }); //on error redirect to custom 404 server not reacheable, retry, redirect back to index   
      }
       //---------------END-----------------//  

       $scope.getStudent = function (){
        var id = $routeParams.id;   
//$http.get('http://localhost:3000/profile/students/'+ id)
         $http({
            method : "POST",
            url : "http://localhost:3000/profile/students/"+id,
            data: codeprintdata
        }).then(function(response){
            $scope.student = response.data;
            //console.log(response.data);
            var accountstatus = $(".profile").attr('p');
            if (accountstatus == "startup"){
              $scope.studentemail = "";  
            } else if (accountstatus == "free"){
              $scope.studentemail = "";  
            } else {
                $scope.studentemail = response.data.email; 
            }
            
        });    
      } 

      //---------------END-----------------// 
       


      
    $scope.getUniversity = function (){
        //Initialize
        $scope.processedApplication = "0";
        $scope.admissionOffers ="0";    
        //var url = 'http://www.site.com/234234234';
        //var id = url.substring(url.lastIndexOf('/') + 1);
        //alert(id); // 234234234 
        //OR
        var id = $routeParams.id; 
        /*$http.get('http://localhost:3000/universities/'+ id)*/
       $http({
            method : "POST",
            url : "http://localhost:3000/profile/universities/"+id,
            data: codeprintdata
        }).then(function(response){
            $scope.university = response.data;
            $(".sgdot").hide(); //Signed Out
            
    var profileavatar = response.data.first_name;
    $scope.avatarletter =  profileavatar.charAt(0);      
            
    var proccessedstudents = $scope.processedApplication = response.data.processed_students.length;
    //var proccessedstudents = $scope.processedApplication = 1000000;// For testing max numbers ;    
            if (proccessedstudents >= 999999){
              $scope.processedApplication = "1M+";
              //.substring(0, 5) + "-"  //For ... replacement   
            }
   var admissionoffers =  $scope.admissionOffers = response.data.admission_offers.length;
  /*  var recruitedstudentsnum = parseInt($(".admissionOffers").text());
            alert(recruitedstudentsnum);
            var increcruitedstudentnum = parseInt(recruitedstudentsnum + 1);    
            $scope.admissionOffers = 23;*/            
  //var admissionoffers =  $scope.admissionOffers = 1000000;// For testing max numbers ;    
            if (admissionoffers >= 999999){
              $scope.admissionOffers = "1M+";
              //.substring(0, 5) + "-"  //For ... replacement   
            } 
    
  $(document).on("click", ".recent-application", function(){
             $scope.$apply(function() {
             $scope.admissionOffers = admissionoffers + 1;
             });         
   });
           
    $(document).on("click", ".message-sent", function(){
             $scope.$apply(function() {
             $scope.processedApplication = proccessedstudents + 1;
             });         
   });           
            
   var sumapplicants =  $scope.allapplctns = response.data.admission_offers.length + response.data.processed_students.length;      
    //var sumapplicants =  $scope.allapplctns = 1000000;// For testing max numbers ;  
            if (sumapplicants >= 999999){
              $scope.allapplctns = "1M+";
              //.substring(0, 5) + "-"  //For ... replacement   
            } 
            
            
        },function myError(response) {
            $scope.errormsg = response.statusText;
            //window.location.href = "500.html";
        }); 

          }   
     //---------------END-----------------// 
    
    
       
    $scope.getUniversities = function (){
        
       $http({
            method : "POST",
            url : "http://localhost:3000/admin/universities",
            data: codeprintdata
        }).then(function(response){
           var universities = response.data;
            console.log(universities);
            $scope.universities = response.data;

        },function myError(response) {
            $scope.errormsg = response.statusText;
            //window.location.href = "500.html";
        }); 

          }   
     //---------------END-----------------// 
    

//Student Profile Page   
    $scope.getUniversitynStudents = function (){
        $scope.processedApplication = "0";
        $scope.admissionOffers ="0";    
        //var id = $routeParams.id;
       // $http.get('http://localhost:3000/authentication').then(function(response){
       // var id = response.data._id;
        var url = document.location.href;
        var uid = url.substring(url.lastIndexOf('/') - 24);
        var length = 24;
        var id = uid.substring(0, length);    
        //$http.get('http://localhost:3000/universities/'+ id)
         $http({
            method : "POST",
            url : "http://localhost:3000/profile/universities/"+id,
            data: codeprintdata
        }).then(function(response){
            $scope.university = response.data;
            var profileavatar = response.data.first_name;
            $scope.avatarletter =  profileavatar.charAt(0);
            $(".sgdot").hide();
        var proccessedstudents = $scope.processedApplication = response.data.processed_students.length;
        //var proccessedstudents = $scope.processedApplication = 1000000;// For testing max numbers ;    
            if (proccessedstudents >= 999999){
              $scope.processedApplication = "1M+";
              //.substring(0, 5) + "-"  //For ... replacement   
            }
        var admissionoffers =  $scope.admissionOffers = response.data.admission_offers.length;
        //var admissionoffers =  $scope.admissionOffers = 1000000;// For testing max numbers ;    
            if (admissionoffers >= 999999){
              $scope.admissionOffers = "1M+";
              //.substring(0, 5) + "-"  //For ... replacement   
            }
            $scope.allapplctns = response.data.admission_offers.length + response.data.processed_students.length;
            //console.log(response.data);

        },function myError(response) {
            $scope.errormsg = response.statusText;
            //console.log(response)
            //window.location.href = "500.html";
        });   
          //  });   
          } //End
     //---------------END-----------------// 
    
   
     //Processed Table Rows
     $scope.getRcrtdStudentPrfl = function (){
        var id = $routeParams.id;  
        //$http.get('http://localhost:3000/recruited/universities/'+ id)
            
        $http({
            method : "POST",
            url : "http://localhost:3000/recruited/universities/"+id,
            data: codeprintdata
        }).then(function(response){
            $scope.uninstd = response.data.admission_offers; //Recruited
            $scope.msgstd = response.data.processed_students; //Messaged
            //console.log(response.data);                   
        });    
      } 
     //---------------END-----------------// 

    }]);//End Controller

   /* myApp.controller('pricingController',['$scope', '$http', '$location', '$routeParams','$anchorScroll', function($scope, $http, $location,  $routeParams, $anchorScroll){

    }]);//End Controller*/

    /* 
    $scope.$on('$routeChangeSuccess', function () {
    //console.log('Route Changed');        
    });
     //---------------END-----------------// 
     */