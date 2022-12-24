/**
 * The Authentication Module
 * @module /lib/auth
 */


/** Imports */
const DataFunctions = require('../lib/data');
const userLoginTracker = require('../.data/users/loginTrackerUser.json');
const userDatabase = require('../.data/users/userDatabase.json');


/** Constants */
const CODE_UNAUTHORISED = 401;
const LOGIN_COOKIE_EXPIRY = 1.728e+9;       //20 DAYS IN MILLISECONDS 
const TIME_DELTA = 86400000;                //One Day 
const PATH_OF_DEPARTMENT_LAYOUT = '../views/layouts/department_index.ejs';

/**
 * @description Array init, array of functions that will be exported 
 * @exports validateUser, ifCookiesExpiry, isUserLoggedIn
 */
class AuthenticationFunctions {};


/**
 * 
 * @description User validator function
 * @param {object} Renderer Response object to route the user
 * @param {object} cookie Cookie data of user containing user data and cookie expiry date
 * @param {string} Requestor User | Admin
 */
AuthenticationFunctions.validateUser = (Renderer, cookie, Requestor) => {
    //refresh our call back data
    DataFunctions.callBackData.clearItems();

    //view
    if (Requestor.toUpperCase() == "USER") {
      succeed_view_bkw = "userlogin_signup";
    }else{
      succeed_view_bkw = "adminlogin_signup";
    }

    //TODO: TO BE IMPROVED BUT WILL DO PERFECT
    if (cookie == undefined) {
      DataFunctions.callBackData.setItem('Login/Signup', '', '', '', '', '')
      Renderer.status(200).render(succeed_view_bkw, DataFunctions.callBackData);
  
    }else{
  
      //TODO: TO MAKE A LOGIC THAT ALWAYS TAKES THE EXPIRY TIME OF A USER STORE IN COOKIE LOGINTRAKER. 
      //      TAKE THE NEW DATE AND IF USER COOKIE ABOUT TO EXPIRE THEN, LOGOUT USER, ELSE CONTINUE THE 
      //      USER TO THE REQUESTED ROUTE.
      //pass the users username and response object to the user login checker to decide users destiny :) 
      const parsedCookieUsername =  cookie.match(DataFunctions.EMIAL_REGEX);
      AuthenticationFunctions.isUserLoggedIn(parsedCookieUsername[0], Renderer, Requestor);
      
      //check the current expiry of user and feed it to a responsible function
      //and update the current time to expire
      const currentTime = Date.now();
      DataFunctions.USERDATA.username = parsedCookieUsername[0];
      const parsedCookieExpiry = cookie.match(DataFunctions.EXPIRY_REGEX)
      const toLength = parsedCookieExpiry.length - 1;
      
      const expiry = parseInt(parsedCookieExpiry[toLength].slice(4));
  
      //quality control measures
      if (!isNaN(expiry) == true){
        DataFunctions.USERDATA.cookie_expiry = expiry; //purify the data
      }else{
        DataFunctions.USERDATA.cookie_expiry = parsedCookieExpiry[toLength].slice(4);
      }
      
      //time that went
      const timeLeft = currentTime - DataFunctions.USERDATA.cookie_expiry;
  
      //days thats left
      const timeToExpire = LOGIN_COOKIE_EXPIRY - timeLeft;
      AuthenticationFunctions.ifCookiesExpiry(DataFunctions.USERDATA.username, timeToExpire, Renderer, Requestor); //TEST PASSED
  
    //END OF IF USER IS LOGGED IN  
    }
    return;
  //END OF FUNCTION
}
  
  
/**
 * 
 * @description Checks if users login cookie is about to expire, if yes then log them out 
 * @param {string} user Users data to be passed to the logout logic
 * @param {number} time Time to be conditioned if about to expire 
 * @param {object} Renderer Response object to render the user
 * @param {string} Requestor User | Admin
 */
AuthenticationFunctions.ifCookiesExpiry = (user, time, Renderer, Requestor) => {

    if (time > TIME_DELTA) {//do nothing
    }else{
        DataFunctions.logoutUser(user, Renderer, Requestor); //TEST PASSED

    }
    return;
}
  
  
/**
 * 
 * @description if Logged in Checker | Validator 
 * @param userData Users emial to be able to process
 * @param Renderer Response object to route users to respective routes
 * @param Requestor User | Admin
 */
AuthenticationFunctions.isUserLoggedIn = (userData, Renderer, Requestor) => {
    DataFunctions.callBackData.clearItems();

    if (Requestor.toUpperCase() == "USER") {
        succeed_view_bkw = "userlogin_signup";
        succeed_view_frd = "departments";
    }else{
        succeed_view_bkw = "adminlogin_signup";
        succeed_view_frd = "dev_chats";
    }
    
    var requestingPerson = userLoginTracker.find(f => f.username == userData); //TODO: HERE

    if (requestingPerson == undefined && userLoginTracker.length < 1){
        //if user not found in loginTackerUser.json file
        DataFunctions.callBackData.setItem('Register', '', '', '', '', '')
        Renderer.status(200).render(succeed_view_bkw, DataFunctions.callBackData);
    }else{
        //redirect to departments if user is loggedin
        // Renderer.redirect('/users/departments');
        DataFunctions.callBackData.title = 'Welcome, User';
        if (Requestor.toUpperCase() == "USER") {
          const userTemplete = userDatabase.find(f => f.username == userData); //TODO: HERE
          DataFunctions.callBackData.setItem('', '', '', PATH_OF_DEPARTMENT_LAYOUT, userTemplete.fullname.split(' ')[0], userTemplete.gender)
        }
        Renderer.status(200).render(succeed_view_frd, DataFunctions.callBackData);
    }

    return;
//END OF FUNCTION
}

/**
 *  
 * @param email Email data of user that will be Authenticated
 * @param Renderer Response object from users request
 */
AuthenticationFunctions.validateEmail = (email, Renderer) => {}



//export the Module
module.exports = AuthenticationFunctions;
  