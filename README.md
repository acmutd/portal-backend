# ACM API

The official Core API of ACM UTD. View API [Documentation](https://api-docs.acmutd.co)

### Quick Start
- Clone the repo
- Install `firebase-tools`
```
$ npm install -g firebase-tools
```
- Login to firebase
```
$ firebase login
```
Note: Make sure to sign in with your ACM G Suite account. If you are already signed in with another account you can use `firebase logout` to sign out first.

#### Testing Locally
- Set up admin credentials following the firebase [docs](https://firebase.google.com/docs/functions/local-emulator#set_up_admin_credentials_optional). The key should be saved at `functions/acm-core-service-account.json` and should not be tracked.
- Output firebase configuration to local file. This file should also not be tracked.
```
$ firebase functions:config:get > functions/.runtimeconfig.json
```
- Deploy locally
```
$ npm run serve
```
⚠️ Pay attention to the warnings! Unless you are emulating other firebase services, your code can still affect production data.

- Acquire a testing `access_token` for auth0 under APIs > ACM Core > Test.

- Finally, you can invoke an endpoint (`/portal/endpoint`) locally either with an http client like curl or postman:
```
curl --request GET \
  --url http://localhost:5002/acm-core/us-central1/portal/endpoint \
  --header 'Authorization: Bearer token'
```
You can also use the [firebase functions shell](https://firebase.google.com/docs/functions/local-shell) if you prefer that.

#### Deploying to production
```
$ npm run deploy
```
### Questions

Sometimes you may have additional questions. If the answer was not found in this readme please feel free to reach out to the [Director of Development](mailto:development@acmutd.co) for _ACM_

We request that you be as detailed as possible in your questions, doubts or concerns to ensure that we can be of maximum assistance. Thank you!

![ACM Development](https://www.acmutd.co/brand/Development/Banners/light_dark_background.png)
