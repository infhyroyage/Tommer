# Developer's Guide

## Installation

TODO

---

local.settings.json

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```

---

## Package Version

| Name       | Ver.    |
| ---------- | ------- |
| Node.js    | 20.10.0 |
| Playwright | 1.40.1  |
| Typescript | 5.1.6   |

> [!NOTE]
> All npm packages except above are maintained by dependabot in every Monday at 1:00(UTC).

## Azure Architecture

![architecture.drawio](./docs/azure-architecture/architecture.drawio.svg)

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

## Logic Apps Architecture

Overall workflow is as follows:

![overall](docs/logic-apps-architecture/overall.png)

### Reccurrence

![reccurrence](docs/logic-apps-architecture/reccurence.png)

Trigger Logic Apps per 6 hours.

### Set mail

![set-mail](docs/logic-apps-architecture/set-mail.png)

Set mail address of user which maintainer want to send.

### Set makers

![set-makers](docs/logic-apps-architecture/set-makers.png)

Set string array of UCS maker whose UCS maintainer want to trace and notificate.

### Initialize Previous UCS List

![initialize-previous-ucs-list](docs/logic-apps-architecture/initialize-previous-ucs-list.png)

Initialize string array of recent UCS at previous Logic Apps running.

### List Blobs at last-updated Container

![list-blobs](docs/logic-apps-architecture/list-blobs.png)

Get the list of blobs at the `last-updated` container of BLOB Storage.

### Check only prev.json at last-updated Container

![check-prev-json](docs/logic-apps-architecture/check-prev-json.png)

Update the previous UCS list if there is only a json file named prev.json in `last-updated` container of BLOB Storage.

### Get Content of prev.json

TODO

### Parse prev.json

TODO

### Update Previous UCS List

![update-previous-ucs-list](docs/logic-apps-architecture/update-previous-ucs-list.png)

Update a variable defined the previous UCS list.

### Run Functions App

![run-functions-app](docs/logic-apps-architecture/run-functions-app.png)

Run Functions App which serves as \[PUT\] /recent. The type of the request body is defined in [functions/src/types.ts](https://github.com/infhyroyage/Tommer/blob/main/functions/src/types.ts).

### Check Response Code of Functions App

TODO

### Terminate

TODO

### Parse Response Body of Functions App

TODO

### Check only prev.json Again at last-updated Container

TODO

### Update Content of prev.json

TODO

### Create prev.json

TODO

### Check Notification UCS List

TODO

### Send Mail

TODO
