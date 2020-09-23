export const typeform_webhook = async (request: any, response: any): Promise<void> => {
  try {
    console.log("hi");
    response.send("bye");
  } catch (err) {
    console.log("no");
  }
};
