# Firebase Admin

`admin.ts` handles centrally initializing the Firebase Admin to access various different services across different files / functions. 

### Usage

When needing to use additional services from firebase instantiate them in `admin.ts` and import them where needed. Also use this place to pass in custom arguments or different configuration parameters. 

### Notes

 - The `service-account.json` file is not passed in as a paramter to `admin.initializeApp()` because the backend is deployed on Firebase Functions and those variables are automatically accessible as environment variables. If the backend is shifted elsewhere then those variables will need to be passed in.
 - If you choose write any standalone scripts store them in this folder.
  
### Questions

Sometimes you may have additional questions. If the answer was not found in this readme please feel free to reach out to the [Director of Development](mailto:development@acmutd.co) for _ACM_

We request that you be as detailed as possible in your questions, doubts or concerns to ensure that we can be of maximum assistance. Thank you!

![ACM Development](https://www.acmutd.co/brand/Development/Banners/light_dark_background.png)