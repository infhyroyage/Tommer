// Parameters
param apiConnAzureblobName string
param apiConnOutlookName string
param functionsName string
param insightsName string
param logicAppName string
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

// Deploy "last-updated" Container of BLOB Storage
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

// Deploy Logic App
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
resource logicApp 'Microsoft.Logic/workflows@2019-05-01' = {
  name: logicAppName
  location: location
  properties: {
    definition: {
      '$schema': 'https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#'
      actions: {
        'Set makers': {
          inputs: {
            variables: [
              {
                name: 'makers'
                type: 'array'
                value: []
              }
            ]
          }
          type: 'InitializeVariable'
        }
        'Set mail': {
          inputs: {
            variables: [
              {
                name: 'mail'
                type: 'string'
                value: ''
              }
            ]
          }
          type: 'InitializeVariable'
        }
        'Initialize Previous UCS List': {
          inputs: {
            variables: [
              {
                name: 'prev'
                type: 'array'
                value: []
              }
            ]
          }
          runAfter: {
            'Set makers': [
              'Succeeded'
            ]
            'Set mail': [
              'Succeeded'
            ]
          }
          type: 'InitializeVariable'
        }
        'List Blobs at last-updated container': {
          inputs: {
            host: {
              connection: {
                name: '@parameters(\'$connections\')[\'apiConnAzureBlob\'][\'connectionId\']'
              }
            }
            method: 'get'
            path: '/v2/datasets/@{encodeURIComponent(encodeURIComponent(\'${storageName}\'))}/foldersV2/@{encodeURIComponent(encodeURIComponent(\'last-updated\'))}'
          }
          runAfter: {
            'Initialize Previous UCS List': [
              'Succeeded'
            ]
          }
          type: 'ApiConnection'
        }
        'Check only prev.json at last-updated container': {
          actions: {
            'Get Content of prev.json': {
              inputs: {
                host: {
                  connection: {
                    name: '@parameters(\'$connections\')[\'apiConnAzureBlob\'][\'connectionId\']'
                  }
                }
                method: 'get'
                path: '/v2/datasets/@{encodeURIComponent(encodeURIComponent(\'${storageName}\'))}/files/@{encodeURIComponent(encodeURIComponent(\'last-updated/prev.json\'))}/content'
              }
              type: 'ApiConnection'
            }
            'Parse prev.json': {
              inputs: {
                content: '@base64ToString(body(\'Get Content of prev.json\')[\'$content\'])'
                schema: {
                  items: {
                    properties: {
                      maker: {
                        type: 'string'
                      }
                      name: {
                        type: 'string'
                      }
                      no: {
                        type: 'integer'
                      }
                      upload: {
                        type: 'string'
                      }
                    }
                    required: [
                      'maker'
                      'no'
                      'name'
                      'upload'
                    ]
                    type: 'object'
                  }
                  type: 'array'
                }
              }
              runAfter: {
                'Get Content of prev.json': [
                  'Succeeded'
                ]
              }
              type: 'ParseJson'
            }
            'Update Previous UCS List': {
              inputs: {
                name: 'prev'
                value: '@body(\'Parse prev.json\')'
              }
              runAfter: {
                'Parse prev.json': [
                  'Succeeded'
                ]
              }
              type: 'SetVariable'
            }
          }
          expression: {
            and: [
              {
                equals: [
                  '@length(body(\'List Blobs at last-updated container\')?[\'value\'])'
                  1
                ]
              }
              {
                equals: [
                  '@body(\'List Blobs at last-updated container\')?[\'value\'][0][\'Name\']'
                  1
                ]
              }
            ]
          }
          runAfter: {
            'List Blobs at last-updated container': [
              'Succeeded'
            ]
          }
          type: 'If'
        }
        'Run Functions App': {
          inputs: {
            body: {
              makers: '@variables(\'makers\')'
              prev: '@variables(\'prev\')'
            }
            function: {
              id: resourceId('Microsoft.Web/sites/functions', functionsName, 'recent')
            }
            method: 'PUT'
          }
          runAfter: {
            'Check only prev.json at last-updated container': [
              'Succeeded'
            ]
          }
          type: 'Function'
        }
      }
      parameters: {
        '$connections': {
          defaultValue: {}
          type: 'object'
        }
      }
      triggers: {
        Recurrence: {
          recurrence: {
            frequency: 'Hour'
            interval: 6
          }
          type: 'Recurrence'
        }
      }
    }
    parameters: {
      '$connections': {
        value: {
          apiConnAzureBlob: {
            connectionId: apiConnAzureBlob.id
            connectionName: apiConnAzureblobName
            id: subscriptionResourceId('Microsoft.Web/locations/managedApis', location, 'azureblob')
          }
          apiConnOutlook: {
            connectionId: apiConnOutlook.id
            connectionName: apiConnOutlookName
            id: subscriptionResourceId('Microsoft.Web/locations/managedApis', location, 'outlook')
          }
        }
      }
    }
    state: 'Enabled'
  }
}
