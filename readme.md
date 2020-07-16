# Title

API for accessing _ACM_ membership portal.

### Quick Start

 - Clone the repo
 - Check if configuration variables are set using `firebase functions:config:get`
 - If the above command does not show the auth0 environment variables then run `firebase functions:config:set auth0.domain=<insert domain> auth0.clientid=<insert client id> auth0.audience=https://harshasrikara.com/api sentry.dns=<insert sentry dns>`
 - `firebase deploy --only functions`
 - Use the portal front-end to test function calls after being authenticated through auth0

### Extended Start Guide

Project structure
```
root
├── firebase.json
├── functions
│   ├── lib
│   │   ├── admin
│   │   │   ├── admin.js
│   │   │   └── admin.js.map
│   │   ├── auth
│   │   │   ├── auth.js
│   │   │   └── auth.js.map
│   │   ├── index.js
│   │   └── index.js.map
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── admin
│   │   │   └── admin.ts
│   │   ├── auth
│   │   │   └── auth.ts
│   │   ├── events
│   │   ├── express.ts
│   │   ├── index.ts
│   │   └── user
│   ├── tsconfig.json
│   └── tslint.json
├── package-lock.json
└── readme.md
```

### How to Contribute

When testing deployment on a feature branch rename last line in `index.ts` to be as follows

`exports.api-YOURNAME = functions.https.onRequest(app);`

When making a pull request to `dev` ensure that it has been reverted to exports.api.

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

Sometimes you may have additional questions. If the answer was not found in this readme please feel free to reach out to the [Director of Development](mailto:comet.acm@gmail.com) for _ACM_

We request that you be as detailed as possible in your questions, doubts or concerns to ensure that we can be of maximum assistance. Thank you!

![ACM Development](https://www.acmutd.co/brand/Development/Banners/light_dark_background.png)
