require('dotenv').config()
const express = require('express');
const exphbs  = require('express-handlebars');
const session = require("express-session");
const bodyParser = require('body-parser');
const axios = require('axios');
var auth = require('./auth.js')
const qs = require('querystring')

const PORT = process.env.PORT || "3000";

const app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        jwt: function (token){
            var atob = require('atob');
            if (token != null) {
                var base64Url = token.split('.')[1];
                var base64 = base64Url.replace('-', '+').replace('_', '/');
                return JSON.stringify(JSON.parse(atob(base64)), undefined, '\t');
            } else {
                return "Invalid or empty token was parsed"
            }
        }
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use("/static", express.static("static"));

app.use(session({
  cookie: { httpOnly: true },
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: true
}));
 
var auth = new auth();
app.use(auth.setContext)
app.use('/login', auth.handleLogin)
app.use('/refresh',auth.handleRefresh)
app.use('/reauth',auth.handleReauthorize)
app.use('/authorization-code/callback',auth.handleCallback)

app.use(async function (req,res,next){
  res.locals.styling = process.env.BRANDING_CSS
  res.locals.brand = process.env.BRAND,
  next();
})
  
const router = express.Router();
router.get("/",auth.ensureAuthenticated(), async (req, res, next) => {
  var user = req.userContext.claims.sub
  if(req.userContext.claims.on_behalf){
    user = user +" on behalf of "+req.userContext.claims.on_behalf_sub
  }

  var authority
  try{
    var resp = await axios.get(process.env.MANAGED_ACCESS_SERVICE_URI + '/agent',{headers:{Authorization: "Bearer "+req.userContext.tokens.access_token}})
    authority = resp.data
  }
  catch(err){
    console.log(err)  
  }

  res.render("index",{
    user: user,
    idtoken:req.session.user.id_token,
    accesstoken: req.session.user.access_token,
    refreshtoken: req.session.user.refresh_token,
    customLink: process.env.CUSTOM_LINK,
    customLinkText: process.env.CUSTOM_LINK_TEXT,
    authority: authority
    });

});

router.post("/authority", urlencodedParser, async(req,res,next) => {
  try{
        var response = await axios.post(process.env.MANAGED_ACCESS_SERVICE_URI + '/agent',
        {
          entityid: req.body.identity,
        },{headers:{Authorization: "Bearer "+req.session.user.access_token}})
        
        console.log("called ")
        var identifier = response.data.id
        console.log(identifier)
        if(req.session.user.refresh_token){
          res.redirect('/refresh')
        }
        else{
          var stateQuery = qs.stringify({
            "state":identifier})
          res.redirect('/reauth?'+stateQuery)
          //refresh the token with redirect if refresh token is not available
          //res.status(err.status || 500);
          //res.render('error', { title: 'Get with redirect is not implemented.' });
        }
    }
    catch(err){
      console.log(err)
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render('error', { title: 'Error' });
    }
})
app.use(router)

app.get("/logout", (req, res) => {
  if(req.userContext){
    let protocol = "http"
    if(req.secure){
        protocol = "https"
    }
    else if(req.get('x-forwarded-proto')){
        protocol = req.get('x-forwarded-proto').split(",")[0]
    }
    const tokenSet = req.userContext.tokens;
    const id_token_hint = tokenSet.id_token
    req.session.destroy();
    if(id_token_hint){
      res.redirect(process.env.OKTA_OAUTH2_ISSUER+'/v1/logout?id_token_hint='
          + id_token_hint
          + '&post_logout_redirect_uri='
          + encodeURI(protocol+"://"+req.headers.host)
          );
    }
    else{
      res.redirect("/")
    }
  }
  else {
    res.redirect("/")
  }
  });

  app.listen(PORT, () => console.log('App started.'));