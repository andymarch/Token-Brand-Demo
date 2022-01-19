# Token Brand Demo

This demo is a minimum viable application with allows the users to authenticate against the IDP
and request a OAuth token with a set of scopes then displays the resulting tokens returned.

This simple application can be used to demonstrate the configuration of OAuth
authorization server especially injecting claims for a given user on a given
brand.

# Getting Started

## Running on Heroku
Deploying to Heroku is the fastest way to get started with this demo. The button
below will setup a Heroku app with this codebase, you will need to configure the
application in Okta.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

* Give your application a name
* Configure your a OIDC application in your Okta tenant according to [this
  guide](https://developer.okta.com/docs/guides/sign-into-web-app/nodeexpress/create-okta-application/)
  (if you don't have an Okta tenant sign up for free at
  [developer.okta.com](https://developer.okta.com)), the redirect URI you will
  need to https://<your app name>.herokuapp.com/authorization-code/callback
 * Press ```Deploy app```


## Running Locally
This is a lightweight express application once you have node installed on your
machine:
* clone this repo
* run ```npm install```
* create a ```.env``` file with the content shown in [Configuration](#Configuration)
    * follow [this
      guide](https://developer.okta.com/docs/guides/sign-into-web-app/nodeexpress/create-okta-application/)
      to get your application setup on Okta
* run ```npm run start```

# Configuration

All configuration is driven from the ```.env``` file A sample is provided in the
```.env.example```.

The following configuration sets up the application as an OIDC application with
your IDP.

```
#REQUIRED
OKTA_OAUTH2_ISSUER=https://*your-tenant*.okta.com/oauth2/default
OKTA_OAUTH2_CLIENT_ID_WEB=*your-clientid*
OKTA_OAUTH2_CLIENT_SECRET_WEB=*your-client-secret*
SESSION_SECRET=*a random secret to protect the session*
SCOPES=openid profile
BASE_URI=http://localhost:3000
TOKEN_AUD=api://default
EMBED_SIGN_IN=false

#OPTIONAL
CUSTOM_LINK=https://google.com
CUSTOM_LINK_TEXT=Let me google that

#Only needed locally
PORT=3000
```

### Using embedded widget

To enable the embedded widget switch the value of ```EMBED_SIGN_IN``` to ```true```. This then uses the embedded Okta Signin Widget on the /login route rather than redirecting to the IDP. For this to function you will need to add the value you declared in ```BASE_URI``` as a CORS permitted endpoint in Okta, [see docs](https://developer.okta.com/docs/guides/enable-cors/main/#grant-cross-origin-access-to-websites).


## Customising the branding

Two optional configuration values allow you to customise the experiance to show
different brands on different configurations.

```
BRAND=*Plain text label*
BRANDING_CSS=*absolute path to a css file to customise the layout*
```

This CSS file should be hosted somewhere publically available. Values you will
want to update are:

```
#BrandLogo{
    height: 200px;
    width: 400px;
    background-image: url('*your brand logo*');
}

html{
    background: *your background*;
}

body{
    color: *your font colour*;
}
```