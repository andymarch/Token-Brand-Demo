# Token Brand Demo

This demo sends the user directly to their IDP to authenticate and grant
a set of scopes then displays the resulting tokens returned.

This simple application can be used to demonstrate the configuration of OAuth
authorization server especially injecting claims for a given user on a given
brand.

# Getting Started

## Running Locally
This is a lightweight express application once you have node installed on your
machine:
* clone this repo
* run ```npm install```
* create a ```.env``` file with the content shown below
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
TENANT=https://*your-tenant*.okta.com
ISSUER=https://*your-tenant*.okta.com/oauth2/default
BASE_URI=https://*your-host*
REDIRECT_URI=https://*your-host*/callback
CLIENT_ID=*your-clientid*
CLIENT_SECRET=*your-client-secret*
SESSION_SECRET=*a random secret to protect the session*
PORT=3000
TOKEN_AUD=api://default
SCOPES=openid profile
```

# Customising the branding

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