# Portal

This code drives the majority of the backend responsible for powering the ACM Portal. 

### Portal Functions

```
// fill at later point in time
```
### Typeform Functions

The typeform functions section is very mature and is responsible for all interactions with the third party service. 

##### Open Webhook

The `typeform_webhook` function present in [typeform.ts](./typeform.ts) is responsible for receiving all incoming webhook requests from typeform. When creating a new typeform make sure to add in the following url as a webhook: `https://us-central1-acm-core.cloudfunctions.net/challenge/typeform`.

This function will extract all the information within the typeform response body and save only the relevant fields in the following format. An array of `qa` type objects represents the final state of the object that is persisted in Cloud Firestore. This format makes it easy to quickly retrieve typeform responses and perform additional manipulation with Firestore Triggers.

```
export interface qa {
  question: string;
  answer: string;
  type: string;
}
```

Hidden fields are also extracted from Typeform submissions and saved in the same format. In this situation the `question` will be the hidden field key and the `answer` will be the hidden field value. 

##### Confirmation Emails

One essential part to ensuring that members who submit forms to ACM are happy and aware that their submission was received is to send them confirmation emails. While typeform natively supports sending confirmation emails it does not support the ability to customize and design them to match the ACM Brand Guidelines. In [typeform.ts](./typeform.ts) we have the `send_confirmation` firestore trigger. This function gets run anytime a new typeform document gets saved in Cloud Firestore. 

This functions queries the `typeform_meta` firestore collection with the `typeform_id` to see whether there exists a confirmation email that should be sent. If the exists information regarding the Sendgrid template / sender information then this firestore trigger will call the Sendgrid API to send out that specific email. Adding a new configuration can be done through the officer utility [Sendgrid x Typeform](https://survey.acmutd.co/email). 

##### Custom Actions

Sometimes we want to perform a custom action based on the submission of a typeform. These are typically the internal utilities made for the ACM officer to refine workflows. All custom action functions are saved in [Custom Actions](../custom). These are also Firestore Triggers and get executed anytime a new document is created. The following functions have custom triggers:

 - [Vanity Form](https://survey.acmutd.co/vanity)
 - [Sendgrid Form](https://survey.acmutd.co/email)
 - [Event Form](https://survey.acmutd.co/event)

### Questions

Sometimes you may have additional questions. If the answer was not found in this readme please feel free to reach out to the [Director of Development](mailto:development@acmutd.co) for _ACM_

We request that you be as detailed as possible in your questions, doubts or concerns to ensure that we can be of maximum assistance. Thank you!

![ACM Development](https://www.acmutd.co/brand/Development/Banners/light_dark_background.png)