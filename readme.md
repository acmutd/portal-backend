# ACM API

The official API of ACM UTD. View API [Documentation](https://documenter.getpostman.com/view/6712035/TVKJxEVW)

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
- Acquire a testing access_token for auth0 under Applications > Dev Testing API (Test Application) > Quick start.

- Finally, you can invoke a function (`exampleFunction`) locally either with an http client like curl or postman:
```
curl --request GET \
  --url http://localhost:5001/acm-core/us-central1/api/exampleFunction \
  --header 'Authorization: Bearer token'
```
You can also use the [firebase functions shell](https://firebase.google.com/docs/functions/local-shell) if you prefer that.

#### Deploying to production
```
$ npm run deploy
```

### Extended Start Guide

Project structure
```
root
├── firebase.json
├── functions
│   ├── acm-core-service-account.json
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── admin
│   │   │   └── admin.ts
│   │   ├── application
│   │   │   ├── rebrand.ts
│   │   │   └── typeform.ts
│   │   ├── auth
│   │   │   └── auth.ts
│   │   ├── authTypes.ts
│   │   ├── challenge
│   │   │   └── challenge.ts
│   │   ├── custom
│   │   │   ├── hacktoberfest.ts
|   |   |   ├── hackutd.ts
│   │   │   └── vanity.ts
│   │   ├── divisions
│   │   │   ├── GET
│   │   │   ├── POST
│   │   │   └── divisions.ts
│   │   ├── events
│   │   │   └── events.ts
│   │   ├── express_configs
│   │   │   ├── express_open.ts
│   │   │   └── express_secure.ts
│   │   ├── index.ts
│   │   ├── mail
│   │   │   ├── mailchimp.ts
│   │   │   └── sendgrid.ts
│   │   ├── roles
│   │   │   ├── permissions.ts
│   │   │   └── roles.ts
│   │   └── services
│   │       └── ErrorService.ts
│   ├── tsconfig.json
└── readme.md
```

### How to Contribute

Reach out to the [Director of Development](mailto:development@acmutd.co) to learn more about how to contribute to our open source projects. If you are interested in joining the team as a developer learn more in the [dev readme](https://github.com/acmutd/Development/blob/master/developer.md). 

If you'd like to take ownership over a project or become a core maintainer for these projects learn more about becoming an _ACM Development_ officer in the [officer readme](https://github.com/acmutd/Development/blob/master/dev_officer.md). 

##### Pull Requests & Issues

Follow _ACM Development_ standards and guidelines. 2 approving reviews required for merge. Tag all developers on team as reviewers. Review code within 48hrs of making a pull request.

### Contributors

 - [Harsha Srikara](https://harshasrikara.com)
 - [David Richey](https://darichey.com)
 - [Aliah Shaira De Guzman]()
 - [Sivam Patel](https://github.com/sivampatel)
 - [Kendra Huang](https://github.com/kendra-huang)
 - [Jafar Ali](https://github.com/jafrilli)

### Questions

Sometimes you may have additional questions. If the answer was not found in this readme please feel free to reach out to the [Director of Development](mailto:development@acmutd.co) for _ACM_

We request that you be as detailed as possible in your questions, doubts or concerns to ensure that we can be of maximum assistance. Thank you!

![ACM Development](https://www.acmutd.co/brand/Development/Banners/light_dark_background.png)
