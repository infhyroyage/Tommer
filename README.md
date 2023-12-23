# Tommer

[![Create Azure Resources](https://github.com/infhyroyage/Tommer/actions/workflows/create-azure-resources.yaml/badge.svg)](https://github.com/infhyroyage/Tommer/actions/workflows/create-azure-resources.yaml)
[![Scan Javascript/Typescript by CodeQL](https://github.com/infhyroyage/Tommer/actions/workflows/codeql.yaml/badge.svg)](https://github.com/infhyroyage/Tommer/actions/workflows/codeql.yaml)

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
