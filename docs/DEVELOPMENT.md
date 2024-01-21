# Developer's Guide

## Azure Architecture

![architecture.drawio](./azure-architecture/architecture.drawio.svg)

| Type                 | Name                             | Description                                           |
| -------------------- | -------------------------------- | ----------------------------------------------------- |
| Resource Group       | `AZURE_RESOURCE_GROUP`           | Resource Group with All Resources                     |
| Logic Apps           | `AZURE_LOGIC_APP`                | Run Functions Apps and Save Recent UCS per 6 hours    |
| API Connection       | `AZURE_API_CONNECTION_AZUREBLOB` | Logic Apps Connection with BLOB Storage               |
| API Connection       | `AZURE_API_CONNECTION_OUTLOOK`   | Logic Apps Connection with Outlook.com                |
| Functions App        | `AZURE_FUNCTIONS`                | Trace and Notificate Recent UCS                       |
| App Service Plan     | `AZURE_FUNCTIONS_PLAN`           | Consumption Plan of Functions App                     |
| Storage Account      | `AZURE_STORAGE`                  | Mount Runtime of Function Apps and Store Previous UCS |
| Application insights | `AZURE_APPLICATION_INSIGHTS`     | Log Function Apps                                     |

## Functions App

You can construct the local development environment for Functions App.

### Local Installation

1. Install as following requirements:
   - [Node.js](https://nodejs.org) (Over v20.x.x)
   - [Azure Functions Core Tools](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local) (Over v4.x)
2. Fork this repository and clone it.
3. Install NPM packages:
   ```bash
   npm i
   ```
4. Create a new json file at the root directory named local.settings.json whose content is:
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "FUNCTIONS_WORKER_RUNTIME": "node"
     }
   }
   ```

### NPM Package Version

| Name       | Ver.    |
| ---------- | ------- |
| Node.js    | 20.10.0 |
| Playwright | 1.40.1  |
| Typescript | 5.1.6   |

> [!NOTE]
> All npm packages except above are maintained by dependabot in every Monday at 1:00(UTC).

### Development

1. Run the typescript compiler with file-watching mode:
   ```bash
   npm run watch
   ```
2. Run Azure Functions Core Tools at another terminal:
   ```bash
   npm run start
   ```
3. After development, run lint and test at another terminal:
   ```bash
   npm run lint
   npm run test
   ```

## Logic Apps

Deploy Logic Apps in your own Azure subscription because ee do not intend to install the local development environment for Logic Apps. The Overall Architecture of Logic Apps is as follows:

![overall](./logic-apps-development/overall.png)

### Reccurrence

![reccurrence](./logic-apps-development/reccurence.png)

Trigger running Logic Apps per 6 hours.

### Set mail

![set-mail](./logic-apps-development/set-mail.png)

Set a string of the user's email address which maintainer want to send.

### Set makers

![set-makers](./logic-apps-development/set-makers.png)

Set a string array of UCS maker whose UCS maintainer want to trace and notificate.

### Initialize Previous UCS List

![initialize-previous-ucs-list](./logic-apps-development/initialize-previous-ucs-list.png)

Initialize a array of UCS at the previous Logic Apps running. The UCS is defined in [functions/types.ts](https://github.com/infhyroyage/Tommer/blob/main/functions/types.ts).

> [!NOTE]
> The array of UCS is called "UCS List" as below.

### List Blobs at last-updated Container

![list-blobs](./logic-apps-development/list-blobs.png)

Get the list of blobs at the `last-updated` container of BLOB Storage.

### Check only prev.json at last-updated Container

![check-prev-json](./logic-apps-development/check-prev-json.png)

Check whther there is only a json file named prev.json in `last-updated` container of BLOB Storage.

### Get Content of prev.json

![get-prev-json](./logic-apps-development/get-prev-json.png)

Get a base64 encoded string which is composed from a content of prev.json.

### Parse prev.json

![parse-prev-json](./logic-apps-development/parse-prev-json.png)

Decode from a base64 encoded string to a json content of prev.json. The json type is equal to the UCS List.

### Update Previous UCS List

![update-previous-ucs-list](./logic-apps-development/update-previous-ucs-list.png)

Update a variable of the UCS List at the previous Logic Apps running.

### Run Functions App

![run-functions-app](./logic-apps-development/run-functions-app.png)

Run Functions App which serves as \[PUT\] /recent. The type of the request body is defined in [functions/types.ts](https://github.com/infhyroyage/Tommer/blob/main/functions/types.ts).

### Check Response Code of Functions App

![check-response-code](./logic-apps-development/check-response-code.png)

Check whether the Functions App running is valid. If it is invalid, the Logic Apps running is also regarded as invalid.

### Terminate

![terminate](./logic-apps-development/terminate.png)

Abort the Logic Apps Running regarded as invalid.

### Parse Response Body of Functions App

![parse-response-body](./logic-apps-development/parse-response-body.png)

Parse from the response body of the Functions App running to the object. The type of the response body is defined in [functions/types.ts](https://github.com/infhyroyage/Tommer/blob/main/functions/types.ts).

### Check Notification UCS List

![check-notifications](./logic-apps-development/check-notifications.png)

Check whether there is any notifications in the response body of the Functions App running. If the number of notifications is over 1, the Logic Apps is going to send a email to the user.

### Send Mail

![send-mail](./logic-apps-development/send-mail.png)

Send email with the subject of the Logic Apps workfow's ID and the body of notifications in the response body of the Functions App running.

### Check only prev.json Again at last-updated Container

![check-prev-json-again](./logic-apps-development/check-prev-json-again.png)

Check again in "Check only prev.json at last-updated Container".

### Update Content of prev.json

![update-prev-json](./logic-apps-development/update-prev-json.png)

Update prev.json in `last-updated` container of BLOB Storage. The UCS List is composed by the response body of the Functions App running.

### Create prev.json

![create-prev-json](./logic-apps-development/create-prev-json.png)

Create prev.json in `last-updated` container of BLOB Storage. The UCS List is composed by the response body of the Functions App running.
