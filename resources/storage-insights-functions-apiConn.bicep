// Parameters
param apiConnAzureblobName string
param apiConnOutlookName string
param functionsName string
param insightsName string
param storageName string

param location string = resourceGroup().location

// Deploy Storage Account
resource storage 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}
resource blob 'Microsoft.Storage/storageAccounts/blobServices@2022-09-01' = {
  name: 'default'
  parent: storage
}
resource container 'Microsoft.Storage/storageAccounts/blobServices/containers@2022-09-01' = {
  parent: blob
  name: 'last-updated'
  properties: {
    publicAccess: 'None'
  }
}

// Deploy Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: insightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
  }
}

// Deploy Azure Functions
resource functionsPlan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: functionsName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
}
resource functions 'Microsoft.Web/sites@2022-09-01' = {
  name: functionsName
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: functionsPlan.id
    siteConfig: {
      appSettings: [
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageName};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storage.listKeys().keys[0].value}'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'PLAYWRIGHT_BROWSERS_PATH'
          value: '0'
        }
        {
          name: 'WEBSITE_CONTENTAZUREFILECONNECTIONSTRING'
          value: 'DefaultEndpointsProtocol=https;AccountName=${storageName};EndpointSuffix=${environment().suffixes.storage};AccountKey=${storage.listKeys().keys[0].value}'
        }
        {
          name: 'WEBSITE_CONTENTSHARE'
          value: toLower(functionsName)
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~20'
        }
        {
          name: 'APPINSIGHTS_INSTRUMENTATIONKEY'
          value: appInsights.properties.InstrumentationKey
        }
      ]
    }
  }
}

// Deploy API Connection
resource apiConnAzureBlob 'Microsoft.Web/connections@2016-06-01' = {
  name: apiConnAzureblobName
  location: location
  properties: {
    api: {
      id: subscriptionResourceId('Microsoft.Web/locations/managedApis', location, 'azureblob')
    }
    displayName: apiConnAzureblobName
    parameterValues: {
      accessKey: storage.listKeys().keys[0].value
      accountName: storageName
    }
    testLinks: [
      {
        method: 'get'
        requestUri: '${environment().gallery}:443/subscriptions/${subscription().subscriptionId}/resourceGroups/${resourceGroup().name}/providers/Microsoft.Web/connections/azureblob/extensions/proxy/testconnection?api-version=2016-06-01'
      }
    ]
  }
}
resource apiConnOutlook 'Microsoft.Web/connections@2016-06-01' = {
  name: apiConnOutlookName
  location: location
  properties: {
    api: {
      id: subscriptionResourceId('Microsoft.Web/locations/managedApis', location, 'outlook')
    }
    displayName: apiConnOutlookName
    testLinks: [
      {
        method: 'get'
        requestUri: '${environment().gallery}:443/subscriptions/${subscription().subscriptionId}/resourceGroups/${resourceGroup().name}/providers/Microsoft.Web/connections/outlook/extensions/proxy/testconnection?api-version=2016-06-01'
      }
    ]
  }
}
