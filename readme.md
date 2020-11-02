# Token Brand Demo

This demo sends the user directly to their IDP to authenticate and grant
a set of scopes then displays the resulting tokens returned.

This simple application can be used to demonstrate the configuration of OAuth
authorization server especially injecting claims for a given user on a given
brand.

# Getting Started

## Running on Heroku
Deploying to Heroku is the fastest way to get started with this demo.

### Beta auto deploy with a new tenant

To provision you an instance of Okta to use with the application we are using the
[Beta Okta Heroku add on](https://devcenter.heroku.com/articles/okta).

>
>You will need a verified Heroku account to continue with this process, please create one [here](https://signup.heroku.com) if
>you do not already have one and make sure you are signed in.
>
>While verification will require you to enter payment information this
>demonstration only provisions free resources and will not cost you anything to
>run.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

* Give your application a name and press ```Deploy app```
* Once deployment has completed press "View" to launch your application.

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

#OPTIONAL
CUSTOM_LINK=https://google.com
CUSTOM_LINK_TEXT=Let me google that

#Only needed locally
PORT=3000
```

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