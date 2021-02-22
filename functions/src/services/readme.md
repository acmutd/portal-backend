# Logging in ACM Core

Logging is an important aspect of being able to understand the sequence of events that take place in the API. Several aspects make using regular `console.log` statements not ideal in a production context. We would like to have a logging solution which is robust, scalable, queryable, triggers alerts & more. 

### LogDNA

The current solution used by ACM Core is using LogDNA as a third party external service. LogDNA has several premium features which are free for students and this guide will explain how to connect your LogDNA account to ACM Core. 

 - [LogDNA Student](https://www.logdna.com/github-students)

Set up a student account by following the steps at the link above. Once you have completed setting up an account grab your ingestion id and return to this readme.

### Add to Logging Service

The [logging.ts](./logging.ts) file sets up a `Logger` class that manages sending log information to everyone who has associated an ingestion id with the ACM Core project.

##### Adding to Firebase Functions Config

 The first thing that we will need to do is add your LogDNA Ingestion ID as an environment variable. You can add it to the firebase functions config as follows. Make sure to replace `yourname` and `your-ingestion-id` in the command below. Make sure to just use your first name and not have any spaces in the command.

```
$ firebase functions:config:set logdna.yourname=your-ingestion-id
```

After this update the `.runtimeconfig.json` file with the new environment variable. Make sure to be at the root of the repository before running this command.

```
$ firebase functions:config:get > functions/.runtimeconfig.json
```

##### Updating the Logger

In [logging.ts](./logging.ts) create a new LogDNA logger instance by duplicating the line below and changing the name of the logger to be your own. Also update the environment variable being passed in to be `functions.config().logdna.yourname` that was set in the previous section.

```
const harsha_logger = logdna.createLogger(functions.config().logdna.harsha, options);
```

Next append your logger to the array of LogDNA instances within the Logger class. 

```
private logdna_loggers = [harsha_logger, YOURNAME_logger /*, insert additional loggers */];
```

That's it! Your logger will now receive all the log data from the API and can be accessed in the LogDNA cloud console.

##### Using the Logger

An instance of the logger class can be imported into any file as follows

```
import logger from "../services/logging";
```

Using the logger is as simple as using the single `.log()` function.

```
logger.log("hello world");
```

The logger is capable of receiving objects too which can then be queryed in the LogDNA cloud console for additional visibility.

```
logger.log({
    ...my_object,
    message: "logging a new message",
});
```

You can also log entire request or response bodies when receiving an http request but this is not receommended since it makes log traversal much more challenging. There is also no need to log information like timestamps or environment context. These variables are automatically logged and tracked.

### Questions

Sometimes you may have additional questions. If the answer was not found in this readme please feel free to reach out to the [Director of Development](mailto:development@acmutd.co) for _ACM_

We request that you be as detailed as possible in your questions, doubts or concerns to ensure that we can be of maximum assistance. Thank you!

![ACM Development](https://www.acmutd.co/brand/Development/Banners/light_dark_background.png)
