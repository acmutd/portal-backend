# Express Configurations

The ACM Core API is broken down into several smaller sections that are designed to receive input from different sources. These different sources may have different forms of Authorization (or none at all). To handle this easily and make the code more readable those different possibilities for the API Requests are broken down into separate Express instances. 

### express_open.ts

The endpoints served by express_open are unprotected endpoints that anyone can make an API call to without Authorization. The primary purpose of this endpoint is to serve as a place to receive webhooks easily. Webhooks from Typeform are received by this endpoint. In addition to that the ACM Development Challenge 0 is also served through this Express instance. 

```
https://us-central1-acm-core.cloudfunctions.net/challenge/
```

The endpoints are deployed under `/challenge`

### express_cf.ts

Handles applications where the authorization is provided through Cloudflare Access

```
https://us-central1-acm-core.cloudfunctions.net/cf/
```

The endpoints are deployed under `/cf`

### express_secure.ts

Handles applications where authorization is provided through Auth0

```
https://us-central1-acm-core.cloudfunctions.net/api/
```

The endpoints are deployed under `/api`

### express_portal.ts

Handles API Requests from the [portal](https://app.acmutd.co). Part of the configuration for this express configuration is identical to both `express_secure.ts` and `express_cf.ts`. This one express instance can handle receiving tokens that are signed either by Auth0 or by Cloudflare Access. That is accomplished by subrouting the requests under `/portal/auth0` or `/portal/gsuite`.

Requests that are sent to `/portal/auth0` must come from a single signed in account. Those API calls only have permission to access the profile and documents of their user. One user cannot access or perform any CRUD operations on another user. JWT sub is used as a primary key to ensure that a user cannot tamper with the database by making raw API calls.

Requests that are sent to `/portal/gsuite` are for officer-exclusive operations. When authenticated through Cloudflare Access it allows for officers to effectively perform any operation on any user. Do not share your personal `access_token` signed by G Suite with anyone. 

Unauthenticated requests can be sent to `/portal`. This is useful for situations where people would like to access public information for their third party applications. This could be fetching a list of events or a list of open applications. 

```
https://us-central1-acm-core.cloudfunctions.net/portal
```

The endpoints are deployed under `/portal`

### Questions

Sometimes you may have additional questions. If the answer was not found in this readme please feel free to reach out to the [Director of Development](mailto:development@acmutd.co) for _ACM_

We request that you be as detailed as possible in your questions, doubts or concerns to ensure that we can be of maximum assistance. Thank you!

![ACM Development](https://www.acmutd.co/brand/Development/Banners/light_dark_background.png)
