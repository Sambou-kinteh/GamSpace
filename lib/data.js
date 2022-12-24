/**
 * The data processing module
 * @module lib/data
 */

// TODO: WRITE TO THE WRITEFILE FUNCTION
// TODO: DEFINE THE DELETE FUNCTION AND MAKE SURE NOT TO USE THE ODD ONE OUT ALGORITHM
// TODO: MAIN AIM: TO NEVER RESTART THE NODE APP AND SAY BYE BYE TO NODEMON AND PM2
// TODO: ALL FILE OPERATOINS SHOULD BE IN AN IO STEAM

// !IMP0RTANT: ENCRYPTION OF PASSWORDS ARE THROUGH 'sha256' AND 'base64' ENCODING

/** Imports */
const fs = require('fs');
const userDatabase = require('../.data/users/userDatabase.json');
const userLoginTracker = require('../.data/users/loginTrackerUser.json');
// const errorLog = require('../data/logs/errorlog.json');
const adminDatabase = require('../.data/admins/adminDatabase.json');
const adminLoginTracker = require('../.data/admins/loginTrackerAdmin.json');
const { setTimeout } = require('timers');
const crypto = require('crypto');
const Joi = require('joi');



/**
 * @description Array init, array of functions that will be exported 
 * @exports LogoutUser, loginUser, CreateUser, modifyUser, deleteUser, userFinder
 */
class DataFunctions {};

/* 
*CONSTANTS 
*/
const APIKEY = 'gAmHaCk2020&fOrEvErKEY';    //for admins to signup
const LOGIN_COOKIE_EXPIRY = 1.728e+9;       //20 DAYS IN MILLISECONDS 
const PATH_OF_USERDATABASE = './.data/users/userDatabase.json';                           //directory from project root to sourcefile
const PATH_OF_USERLOGIN_TRACKER = './.data/users/loginTrackerUser.json';                  //directory from project root to sourcefile
const PATH_OF_ADMINDATABASE = './.data/admins/adminDatabase.json';
const PATH_OF_ADMINLOGIN_TRACKER = './.data/admins/loginTrackerAdmin.json';
const PATH_OF_LOGFILE = './.data/logs/errorlog.json';
const PATH_OF_DEPARTMENT_LAYOUT = '../views/layouts/department_index.ejs';
//call back object the contians all out going info to the user
//to be cleared once data is redundant to prevent a memory leak
DataFunctions.callBackData = {
                  title: '', 
                  serverSignupErrorMessage: '', 
                  serverLoginErrorMessage: '',
                  layout: '',
                  userdata: '',
                  gender: '',
                  clearItems() {
                    this.title = '';
                    this.serverLoginErrorMessage = '';
                    this.serverSignupErrorMessage = '';
                    this.layout = '';
                    // this.userdata = ''; //Should not be cleared
                    // this.gender = ''; //Should not be cleared
                    return;
                  },
                  /**
                   * To set items to the callback object
                   * @param  {...any} args Positional Parameters : title, serverLoginErrorMessage, serverSignupErrorMessage, layout, userdata, gender 
                   * @summary Please specify in any oder, the parameter name then its value i.e title='TITLE'. If you don't need a specific parameter, do for example title parameter e.g "".
                   * @see Other implementations for more insite.
                   */
                  setItem(...args) {
                    
                    const objArgs = Object.assign({}, Array.from(args));

                    try {

                      objArgs[0] === '' ? '' : this.title = objArgs[0];
                      objArgs[1] === '' ? '' : this.serverLoginErrorMessage = objArgs[1];
                      objArgs[2] === '' ? '' : this.serverSignupErrorMessage = objArgs[2];
                      objArgs[3] === '' ? '' : this.layout = objArgs[3];
                      objArgs[4] === '' ? '' : this.userdata = objArgs[4];
                      objArgs[5] === '' ? '' : this.gender = objArgs[5];
                      
                    }catch (exception) {
                      console.log(`Not able to set values ${objArgs} properties`);
                      console.log(exception);

                    }finally{
                      return;
                    }
                      

                  }

};
DataFunctions.EMIAL_REGEX =  /\w+@(gmail)*.com/i;
DataFunctions.EXPIRY_REGEX = /(.com)\d+/g;
DataFunctions.USERDATA = {
                    username: undefined,
                    cookie_expiry: undefined
}


/** initialize an event emitter */ //then configure an event  //not in use at the moment
// DataFunctions.eventEmitter = new events.EventEmitter();


/**
 * 
 * @description Logout function to log users out
 * @param {string} username Username i.e email of user to logout 
 * @param {object} Renderer Response object to route the user to '/'
 * @param {string} Requestor Either user or admin (case insensitive)
 */
DataFunctions.logoutUser = (username, Renderer, Requestor) => {
    DataFunctions.callBackData.clearItems();
    //customised all the variables to suit all possile increments.
    //call a function to unpack and pack.
    //handles both users and admins logouts

    if (Requestor.toUpperCase() == "USER") {
      //if its a users request
      succeed_database_name = 'userDatabase';
      succeed_path = PATH_OF_USERDATABASE;
      succeed_path_tracker = PATH_OF_USERLOGIN_TRACKER;
      succeed_database = userDatabase;
      succeed_cookieName = 'userTracker';
      succeed_tracker = userLoginTracker;
      succeed_tracker_name = 'loginTrackerUser';

    }else{
      //if its an admins request
      succeed_database_name = 'adminDatabase';
      succeed_path = PATH_OF_ADMINDATABASE;
      succeed_path_tracker = PATH_OF_ADMINLOGIN_TRACKER;
      succeed_database = adminDatabase;
      succeed_cookieName = 'adminTracker';
      succeed_tracker = adminLoginTracker;
      succeed_tracker_name = 'loginTrackerAdmin';

    }

    //get the person that wants to log out and logout
    //TODO: TO BE CONTINUED
    let withoutPersonToLogout = DataFunctions.readFile(Requestor.toLowerCase()+'s', succeed_tracker_name);
    // lets manually determine
    console.log(withoutPersonToLogout.username);
    for (let index = 0; index <= withoutPersonToLogout.length; i++){
      if (withoutPersonToLogout.length === 1){
        withoutPersonToLogout = new Array();
        break;
      }else{
        const firstHalf = Math.floor(withoutPersonToLogout.length / 2);
        // const secondHalf = Math.floor(firstHalf);
        if (firstHalf !== 0){
          const ArrayofFirstHalf = new Array(firstHalf);
          let counter = 0;
          while (counter <= firstHalf){
            var element = withoutPersonToLogout[counter];
            Object.getOwnPropertyDescriptor(DataFunctions.logoutUser, 'element').configurable = true;
            if (element.username !== username){null} 
            else{
              delete element;
              break
            }
            counter++;
          }

        }
        
      }
    }
    // withoutPersonToLogout = withoutPersonToLogout.filter(f => f.username !== username);
    DataFunctions.writeFile(Requestor.toLowerCase()+'s', succeed_tracker_name, withoutPersonToLogout);
    
    //update the persons login status in userdatabase
    const fileData = DataFunctions.readFile(Requestor.toLowerCase()+'s', succeed_database_name);
    const requestingPerson = DataFunctions.getPerson(fileData, username);
    requestingPerson.notLoggedin = true;
    requestingPerson.lastLogin = new Date(Date.now());
    DataFunctions.writeFile(Requestor.toLowerCase()+'s', succeed_database_name, fileData);
    
    if (Renderer !== undefined){
        //delete the cookie
        Renderer.cookie(succeed_cookieName, 'expire', {
            expires: new Date(Date.now() + 0),
            httpOnly: true
        });
        return Renderer.status(200).redirect('/');

    }else{
      // renderFile('../views/index');
      console.log('You have done it');
      //TODO: TO BE IMPROVED
    }
}


/**
 * @description Logs in users using their data e.g Username or Email and renderer response object
 * 
 * @param {{}} data Data provided by user to login
 * @param {object} Renderer Response object to route a user
 * @param {string} Requestor The person give the request, either user | admin
 */
DataFunctions.loginUser = (data, Renderer, Requestor) => {
    DataFunctions.callBackData.clearItems();
    let { username, password } = data;

    //hashed version of data
    password = crypto.createHash('sha256', password).update(password).digest('base64');

    const schema = Joi.object({

        username: Joi.string()
                  .max(35)
                  .email()
                  .min(15)
                  .required,
        password: Joi.string().max(15)

      });
    // const { err, val } = schema.validate(usernam, password);
    // TODO: GET JOI WORKING 
    
    if (Requestor.toUpperCase() === "USER") {
      
      succeed_database_name = 'userDatabase';
      succeed_database = userDatabase;
      succeed_path = PATH_OF_USERDATABASE;
      succeed_path_tracker = PATH_OF_USERLOGIN_TRACKER;
      succeed_tracker = userLoginTracker;
      succeed_tracker_name = 'userLoginTracker';
      succeed_view_bkw = 'userlogin_signup';
      succeed_view_frd = 'departments';
      succeed_route = '';
      succeed_cookieName = 'userTracker';
      
    }else{
      
      succeed_database_name = 'adminDatabase';
      succeed_database = adminDatabase;
      succeed_path = PATH_OF_ADMINDATABASE;
      succeed_path_tracker = PATH_OF_ADMINLOGIN_TRACKER;
      succeed_tracker = adminLoginTracker;
      succeed_tracker_name = 'adminLoginTracker';
      succeed_view_bkw = 'login_signup';
      succeed_view_frd = 'dev_chats';
      succeed_route = '';
      succeed_cookieName = 'adminTracker';
      
    }

    DataFunctions.callBackData.setItem('SignUp', 'Please Sign UP', '', '', '', '');
    
    const fileData = DataFunctions.readFile(Requestor.toLowerCase()+'s', succeed_database_name);
    const requestingPerson = DataFunctions.getPerson(fileData, username);
    console.log(requestingPerson, fileData);
    let notLoggedIn = null;

    //TODO:
    succeed_database = fileData;
    (succeed_database.length < 1 || requestingPerson === undefined ? Renderer.render(succeed_view_bkw, DataFunctions.callBackData) : notLoggedIn = requestingPerson.notLoggedin); 
    if(notLoggedIn === null){return;}

    const userTemplete = requestingPerson.fullname === '' ? 'User' : requestingPerson.fullname.split(' ')[0];

    if (notLoggedIn === false && password === requestingPerson.password){
        // TODO: MUST CHANGE THE LAST LOGIN OF USER
        DataFunctions.callBackData.title = 'Welcome Back';
        if (Requestor.toUpperCase() == "USER") {
          DataFunctions.callBackData.setItem('', '', '', PATH_OF_DEPARTMENT_LAYOUT, userTemplete, requestingPerson.gender)
        }
        Renderer.status(200).render(succeed_view_frd, DataFunctions.callBackData);
        return;

    }else if (username === requestingPerson.username && password === requestingPerson.password && notLoggedIn == true) {
      // cookie to track who signin and should be logged out
      const cookieData = username+Date.now()
      Renderer.cookie(succeed_cookieName, cookieData, {
        //expires in 30 days if user does not logout
        expires: new Date(Date.now() + LOGIN_COOKIE_EXPIRY),
        httpOnly: true
      });
      
      //create new json object for user that logs in
      const newUserLog = {
        username
      }
      //TODO: one error to solve, when user logs in, the loginTrackerUser.json file.
      //update the persons login status
      //login the person
      requestingPerson.notLoggedin = false; 
      requestingPerson.lastLogin = new Date(Date.now());
      fs.writeFile(succeed_path, JSON.stringify(fileData), err => console.log(err));
      
      const newUserLogConcat = userLoginTracker.concat(newUserLog);
      DataFunctions.writeFile(Requestor.toLowerCase()+'s', succeed_tracker_name, newUserLogConcat)
      //also update the userlogin tracker variable, using persons email to track
      DataFunctions.callBackData.title = 'Hello User';
      if (Requestor.toUpperCase() == "USER") {
        //safety check :)
        DataFunctions.callBackData.setItem(`Hello, ${userTemplete}`, '', '', PATH_OF_DEPARTMENT_LAYOUT, userTemplete, requestingPerson.gender);
      }
      Renderer.status(200).render(succeed_view_frd, DataFunctions.callBackData);
      return;

    }else{
        DataFunctions.callBackData.setItem('Login Error', 'Incorrect Useranme or Password', '', '','', '')
        Renderer.status(403).render(succeed_view_bkw, DataFunctions.callBackData);
        return;
      }

//END OF LOGIN
}


/**
 * @description Creates users using their data sent to server and renderer response object to give a response
 * @param {object} data Users data from html form
 * @param {object} Renderer Response object from the user post request
 * @param {string} Requestor The person give the request, either user | admin
 */
DataFunctions.createUser = (data, Renderer, Requestor) => {
    DataFunctions.callBackData.clearItems();

    let isUserFound = []; //don't touch
    const PASSWORDPATTERN = /[a-z]*/i; //TODO: WORKING
    const USERNAMEPATTERN = /[a-z]*/i; //TODO: WORKING

    //the globally tally data names 
    let { password , retyped, username } = data.body;
    const copyOfPassword = password;

    password = crypto.createHash('sha256', password).update(password).digest('base64');
    
    if (Requestor.toUpperCase() === "USER") {
    
      var { fullname, gender, phone} = data.body;
      // succeed_database = userDatabase;
      succeed_path = PATH_OF_USERDATABASE;
      succeed_database_name = 'userDatabase';
      succeed_cookieName = 'userTracker';
      // succeed_tracker = userLoginTracker;
      succeed_tracker_name = 'loginTrackerUser';
      succeed_path_tracker = PATH_OF_USERLOGIN_TRACKER;
      succeed_view_bkw = "userlogin_signup";
      succeed_view_frd = "departments";

    }else{

      var { APIKEY_GIVEN } = data.body;
      // succeed_database = adminDatabase;
      succeed_path = PATH_OF_ADMINDATABASE;
      succeed_database_name = 'adminDatabase'
      succeed_cookieName = 'adminTracker';
      // succeed_tracker = adminLoginTracker;
      succeed_tracker_name = 'loginTrackerAdmin';
      succeed_path_tracker = PATH_OF_ADMINLOGIN_TRACKER;
      succeed_view_bkw = "adminlogin_signup";
      succeed_view_frd = "dev_chats";

    }

    let succeed_database = DataFunctions.readFile(Requestor.toLowerCase()+'s', succeed_database_name);
    let succeed_tracker  = DataFunctions.readFile(Requestor.toLowerCase()+'s', succeed_tracker_name); 
    //note: when false don't bypass and bypass when true
    var byPassCreationLogic;

    !(succeed_database === null || succeed_database === undefined) && typeof succeed_database === 'object' 
    ? byPassCreationLogic = false 
    : byPassCreationLogic = true;

    //all the objects from the persons post that should be checked in the system
    // const userUsernames = userDatabase.map(f => f.fullname); //TODO: WILL BE ADDED BACK LATER
    let userEmail;
    let userPhone;

    byPassCreationLogic === false ? userEmail = succeed_database.map(f => f.username) : null;
    byPassCreationLogic === false ? userPhone = succeed_database.map(f => f.phone) : null;
    
    //ALGORITHMIC LOGIC TWO
    let succeed_database_length;
    byPassCreationLogic === true ? succeed_database_length = 0 : succeed_database_length = succeed_database.length;
    if (succeed_database_length !== 0) {

      //TODO: MORE OPTIMISED ALGOTHRIM TO COME IN PLACE

      for (let index = 0; index < userEmail.length; index++) {
        // const element = userUsernames[index];
        const elementEmail = userEmail[index];
        if (userPhone != undefined){
          //if user
          const elementPhone = userPhone[index];
          if (elementEmail == username || elementPhone == phone){
            isUserFound.push(true);
            break
          }else{
            isUserFound.pop();
            isUserFound.push(false);
          }

        }else{
          //if admin
          if (elementEmail == username){
            isUserFound.push(true);
            break
          }else{
            isUserFound.pop();
            isUserFound.push(false);
          }
        }
        
      }
      //loop ends
    }else{isUserFound[0] = false}
    
    const ifUserExists = isUserFound[isUserFound.length - 1] !== false;
    //Check all conditions then sign em up

    if (Requestor.toUpperCase() === "ADMIN") {
      if (APIKEY != APIKEY_GIVEN) {
        DataFunctions.callBackData.setItem('Signup Error', '', 'Api Key Incorrect, Please Contact the administration', '', '', '');
        Renderer.status(403).render(succeed_view_bkw, DataFunctions.callBackData);
        return;
      }
      else if ( !copyOfPassword.match(PASSWORDPATTERN) ) {
        DataFunctions.callBackData.setItem('Signup Error', '', 'Password doesn\'t match standards defined', '', '', '');
        Renderer.status(403).render(succeed_view_bkw, DataFunctions.callBackData);
        return;
      }
      else if ( !username.match(USERNAMEPATTERN) ) {
        DataFunctions.callBackData.setItem('Signup Error', '', 'Username must be an email', '', '', '');
        Renderer.status(403).render(succeed_view_bkw, DataFunctions.callBackData);
        return;
      }

    }
    if (copyOfPassword !== retyped){
      DataFunctions.callBackData.setItem('Signup Error', '', 'Passwords Entered don\'t match', '', '', '');
      Renderer.status(403).render(succeed_view_bkw, DataFunctions.callBackData);
      return;
    }
    else if(ifUserExists){
      DataFunctions.callBackData.setItem('Signup Error', '', 'Sorry Email or Phone number already exists', '', '', '');
      Renderer.status(403).render(succeed_view_bkw, DataFunctions.callBackData);
      return;
    }
    else{
      //add person to the database
      const notLoggedin = false;
      
      const cookieData = username+Date.now();
      Renderer.cookie(succeed_cookieName, cookieData, {
        expires: new Date(Date.now() + LOGIN_COOKIE_EXPIRY),
        httpOnly: true,
      });

      const lastLogin = new Date(Date.now());

      if (Requestor.toUpperCase() !== "ADMIN") {
        //if user
        var filenameDatabase = 'userDatabase';
        var filenameTracker = 'loginTrackerUser';

        let userId;
        byPassCreationLogic !== true ? userId = succeed_database.map(f => f.id) : userId = 0;
        const newUser = {
          id: (byPassCreationLogic === true ? userId : Math.max(...userId)) + 1,
          fullname,
          password,
          gender,
          username,
          phone,
          lastLogin,
          notLoggedin
        }

        //add the person to json file userdatabase.json with datafunction write method
        let newUserConcat;
        byPassCreationLogic === true ? newUserConcat = [newUser] : newUserConcat = succeed_database.concat(newUser);
        DataFunctions.writeFile(Requestor.toLowerCase()+"s", filenameDatabase, newUserConcat);

      //END OF USER
      }else {
        //if admin
        var filenameDatabase = 'adminDatabase';
        var filenameTracker = 'loginTrackerAdmin';

        let adminId;
        byPassCreationLogic !== true ? adminId = succeed_database.map(f => f.id) : adminId = 0;
        const newAdmin = {
          id: (byPassCreationLogic === true ? adminId : Math.max(...adminId)) + 1,
          username,
          password,
          lastLogin,
          notLoggedin
        }

        let newAdminConcat;
        byPassCreationLogic === true ? newAdminConcat = [newAdmin] : newAdminConcat = succeed_database.concat(newAdmin);
        DataFunctions.writeFile(Requestor.toLowerCase()+"s", filenameDatabase, newAdminConcat);

      //END OF ADMIN
      }
      
      const newLoginLog = {
        username
      }

      //add the users login log to logintracker(user | admin).json
      let newUserLogConcat;
      byPassCreationLogic === true ? newUserLogConcat = [newLoginLog] : newUserLogConcat = succeed_tracker.concat(newLoginLog); 
      DataFunctions.writeFile(Requestor.toLowerCase()+"s", filenameTracker, newUserLogConcat);
      
      //render to the person the respective place with the respective data
      DataFunctions.callBackData.title = 'Welcome User';
      if (Requestor.toUpperCase() === "USER") {
        DataFunctions.callBackData.setItem('', '', '', PATH_OF_DEPARTMENT_LAYOUT, fullname.split(' ')[0], gender);
      }
      Renderer.status(200).render(succeed_view_frd, DataFunctions.callBackData);

    }

    return;
//END OF SIGNUP
}


/**
 * @description Timeout function if the cookie used to track user login expires
 * @param callbackFunction Function to call after time reaches
 * @param timeout Time till function be processed
 */
//TODO: USE A COOKIE OR ALWAYS CHECK IF THE COOKIE IS ABOUT TO EXPIRE IF YES THEN LOGOUT THE PERSON
DataFunctions.setTimeoutExpiry = (callbackFunction, timeout) => {
  console.log('event fired');
  //TODO: TO BE IMPROVED TO A MICROSERVICE
  setTimeout(callbackFunction, timeout);
  
  //END OF FUNCTION
}

/**
 * 
 * @param {string} fdir fdir database or json file director inside of the .data director
 * @param {string} filename filename database or json file name to write to
 * @param {string} data !Must be stringified before it can be worked on
 */
DataFunctions.writeFile = (fdir, filename, data) => {

    const pathOfFile = './.data/'+fdir+'/'+filename+'.json';
    fs.writeFile(pathOfFile, data, (err) => {
      console.log(err);
    });
  //end of write function
};


/**
 * 
 * @param {string} fdir database or json file director inside of the .data director
 * @param {string} filename database or json file name to read from
 * @returns {object} a person object that can be dealt with
 */
DataFunctions.readFile = (fdir, filename) =>  {
    const pathOfFile = './.data/'+fdir+'/'+filename+'.json';
    fs.readFile(pathOfFile, 'utf8', (err, data) => {
      if (err){
        console.log(err);
        return null;
      }else {
        if (data === '[]'){
          return null;
        }else{
          if ( typeof data === 'string' && (data !== '' || data !== '[]') ){
            //reuse of our global variable in the global namespace.
            //TODO: TO BE CONTINUED
            DataFunctions.callBackData.layout = JSON.parse(data);
          }else{null}
        }
      };
    });

    return DataFunctions.callBackData.layout;

  //end of function
};


DataFunctions.getPerson = (data, username) => {

  if (!typeof data === 'object'){
    
    try{
      data = JSON.parse(data);
    }catch (TypeError){console.log('Incorrect data format');return;}

  }else {

    const requestingPerson = data.find(f => f.username === username);
    if (requestingPerson){
      return requestingPerson;
    }else return null;

  }
    
  //end of function
};


//delete a User TODO: SHOULD BE IN THE API ROUTE
DataFunctions.deleteUser = (data, Renderer) => {
    //TODO: TO BE COMPLETED
    console.log()
}


/**
 * 
 * @param {object} data the whole request object containing all info of user.
 * @param {object} Renderer the response object to send a response to the requesting user.
 * @param {string} Requestor String for the function to properly handle the request, either 'admin' or 'user'.
 */
DataFunctions.modifyUser = (data, Renderer, Requestor) => {
    
    const { current_password, new_password } = data.body;
    const userData = data.cookies.userTracker.match(DataFunctions.EMIAL_REGEX);
    
    const requestingPerson = userDatabase.find(f => f.username == userData[0]);
    if (requestingPerson.password === current_password){
      if (requestingPerson.password == new_password){}
      else{
        requestingPerson.password = new_password;
        fs.writeFile(PATH_OF_USERDATABASE, JSON.stringify(userDatabase), err => {console.log(err)})
      }
    }
    else{
      Renderer.status(400).end() //bad request
    }
    Renderer.status(200).end(); //all good
    return;
}


DataFunctions.isUserExists = (data, Renderer) => {
    //TODO: TO BE COMPLETED
    console.log()
}


//prepare the functions for export
module.exports = DataFunctions;