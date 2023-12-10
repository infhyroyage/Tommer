# Tommer

[![Create Azure Resources](https://github.com/infhyroyage/Tommer/actions/workflows/create-azure-resources.yaml/badge.svg)](https://github.com/infhyroyage/Tommer/actions/workflows/create-azure-resources.yaml)

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

next.json

```json
[
  {
    "maker": "maker",
    "no": -1
  }
]
```
