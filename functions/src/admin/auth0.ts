import * as axios from "axios";
import * as functions from "firebase-functions";

export const auth0 = async (): Promise<void> => {
  const options = {
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: {
      grant_type: "client_credentials",
      client_id: functions.config().auth0.clientid,
      client_secret: functions.config().auth0.secret,
      audience: `https://${functions.config().auth0.domain}/api/v2/`,
    },
  };

  axios.default
    .post(`https://${functions.config().auth0.domain}/oauth/token`, options)
    .then(function (response) {
      console.log(response.data);
    })
    .catch(function (error) {
      console.error(error);
    });
};
