# Tommer

[![Create Azure Resources](https://github.com/infhyroyage/Tommer/actions/workflows/create-azure-resources.yaml/badge.svg)](https://github.com/infhyroyage/Tommer/actions/workflows/create-azure-resources.yaml)
[![Scan Javascript/Typescript by CodeQL](https://github.com/infhyroyage/Tommer/actions/workflows/codeql.yaml/badge.svg)](https://github.com/infhyroyage/Tommer/actions/workflows/codeql.yaml)
![coverage](https://infhyroyage.github.io/Tommer/badges.svg)

## Overview

Trace Recent UCS of Specified Makers and Nofiticate the Updates

## Get Started

TODO

---

```
az ad sp create-for-rbac --name Tommer_Contributor --role Contributor --scope /subscriptions/{Subscription ID}
```

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

Set string array of each UCS maker whose UCS maintainer want to trace and notificate.

### Initialize Previous UCS List

TODO

### List Blobs at last-updated container

TODO

### Check only prev.json at last-updated container

TODO

### Get Content of prev.json

TODO

### Parse prev.json

TODO

### Update Previous UCS List

TODO

### Run Functions App

TODO

### Check Response Code of Functions App

TODO

### Terminate

TODO

### Parse Response Body of Functions App

TODO

### Check only prev.json Again at last-updated container

TODO

### Update Content of prev.json

TODO

### Create prev.json

TODO

### Check Notification UCS List

TODO

### Send Mail

TODO

## Major Versions

| Name       | Ver.    |
| ---------- | ------- |
| Node.js    | 20.10.0 |
| Playwright | 1.40.1  |
| Typescript | 5.1.6   |

> [!NOTE]
> All npm packages except above are maintained by dependabot in every Monday at 1:00(UTC).

## License

MIT
