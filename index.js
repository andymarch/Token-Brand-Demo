require('dotenv').config()
const express = require('express');
const exphbs  = require('express-handlebars');
const session = require("express-session");
const ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;
const passport = require('passport');

const PORT = process.env.PORT || "3000";
const SIGN_IN = process.env.SIGN_IN || "redirect"

const app = express();

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
  secret: process.env.SESSION_SECRET,
  saveUninitialized: false,
  resave: true
}));
 
var routes = {
  loginCallback: {
    handler: (req, res, next) => {
        //using a custom handler here means that errors are shown with custom error handler rather than plaintext
        const redirectOptions = { 
          successReturnToOrRedirect: '/welcome',
          successRedirect: '/welcome'
        };
        passport.authenticate('oidc', redirectOptions);
        next()
      }   
  }
}
if(SIGN_IN === "embed"){
  routes.login = {
    viewHandler: (req, res, next) => {
      res.render('login', {
        issuer: process.env.OKTA_OAUTH2_ISSUER,
        csrfToken: req.csrfToken()
      });
    }
  }
}

let oidc = new ExpressOIDC({
  issuer: process.env.OKTA_OAUTH2_ISSUER,
  client_id: process.env.OKTA_OAUTH2_CLIENT_ID_WEB,
  client_secret: process.env.OKTA_OAUTH2_CLIENT_SECRET_WEB,
  appBaseUrl: process.env.BASE_URI,
  scope: process.env.SCOPES,
  routes: routes
});

app.use(oidc.router);

app.use(async function (req,res,next){
  res.locals.styling = process.env.BRANDING_CSS
  res.locals.brand = process.env.BRAND,
  next();
})
  
const router = express.Router();

router.get("/", (req, res, next) => {
  res.render("index",{issuer: process.env.OKTA_OAUTH2_ISSUER});
});

router.get("/welcome",oidc.ensureAuthenticated(), (req, res, next) => {
  res.render("welcome",{
      user: req.userContext.userinfo,
      idtoken: req.userContext.tokens.id_token,
      accesstoken: req.userContext.tokens.access_token,
      refreshtoken: req.userContext.tokens.refresh_token,
      customLink: process.env.CUSTOM_LINK,
      customLinkText: process.env.CUSTOM_LINK_TEXT
      });
});
app.use(router)

router.get("/error", (req, res, next) => {
  var title = 'Error'
  var msg =  "Something failed"
  var detail
  if(req.query.error_description){
    msg = req.query.error_description
  }
  if(err){
    detail = err
  }
  res.render("error",{
    title: title,
    msg: msg,
    detail: detail
  })
});

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

app.use((err, req, res, next) => {
  var title = 'Error'
  var msg =  "Somethign failed"
  var detail
  if(req.query.error_description){
    msg = req.query.error_description
  }
  if(err){
    detail = err
  }
  res.render("error",{
    title: title,
    msg: msg,
    detail: detail
  })
})

// An error occurred while setting up OIDC, during token revokation, or during post-logout handling
oidc.on('error', err => {
  var title = 'Error'
  var msg =  "Something failed"
  var detail

  if(err){
    detail = err
  }
  res.render("error",{
    title: title,
    msg: msg,
    detail: detail
  })

});

oidc.on('ready', () => {
  app.listen(PORT, () => console.log('App started.'+
  ' Issuer: ' + process.env.OKTA_OAUTH2_ISSUER +
  ' Client: ' + process.env.OKTA_OAUTH2_CLIENT_ID_WEB +
  ' Scopes: ' + process.env.SCOPES));
})

