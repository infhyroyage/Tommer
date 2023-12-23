// Parameters
param apiConnAzureblobName string
param apiConnOutlookName string
param functionsName string
param logicAppName string
param storageName string

param location string = resourceGroup().location

// Deploy Logic App
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
                      no: {
                        type: 'integer'
                      }
                      name: {
                        type: 'string'
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
        'Check Response Code of Functions App': {
          actions: {
            Terminate: {
              inputs: {
                runError: {
                  code: '@{outputs(\'Run Functions App\')[\'statusCode\']}'
                  message: '@{body(\'Run Functions App\')}'
                }
                runStatus:'Failed'
              }
              type: 'Terminate'
            }
          }
          expression: {
            and: [
              {
                not: {
                  equals: [
                    '@outputs(\'Run Functions App\')[\'statusCode\']'
                    200
                  ]
                }
              }
            ]
          }
          runAfter: {
            'Run Functions App': [
              'Succeeded'
            ]
          }
          type: 'If'
        }
        'Parse Response Body of Functions App': {
          inputs: {
            content: '@body(\'Run Functions App\')'
            schema: {
              properties: {
                notification: {
                  items: {
                    properties: {
                      maker: {
                        type: 'string'
                      }
                      no: {
                        type: 'integer'
                      }
                      name: {
                        type: 'string'
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
                recent: {
                  items: {
                    properties: {
                      maker: {
                        type: 'string'
                      }
                      no: {
                        type: 'integer'
                      }
                      name: {
                        type: 'string'
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
              type: 'object'
            }
          }
          runAfter: {
            'Check Response Code of Functions App': [
              'Succeeded'
            ]
          }
          type: 'ParseJson'
        }
        'Check only prev.json Again at last-updated container': {
          actions: {
            'Update Content of prev.json': {
              inputs: {
                body: '@body(\'Parse Response Body of Functions App\')?[\'recent\']'
                headers:{
                  ReadFileMetadataFromServer: true
                }
                host: {
                  connection: {
                    name: '@parameters(\'$connections\')[\'apiConnAzureBlob\'][\'connectionId\']'
                  }
                }
                method: 'put'
                path: '/v2/datasets/@{encodeURIComponent(encodeURIComponent(\'${storageName}\'))}/files/@{encodeURIComponent(encodeURIComponent(\'last-updated/prev.json\'))}'
              }
              type: 'ApiConnection'
            }
          }
          else: {
            actions: {
              'Create prev.json': {
                inputs: {
                  body: '@body(\'Parse Response Body of Functions App\')?[\'recent\']'
                  headers:{
                    ReadFileMetadataFromServer: true
                  }
                  host: {
                    connection: {
                      name: '@parameters(\'$connections\')[\'apiConnAzureBlob\'][\'connectionId\']'
                    }
                  }
                  method: 'post'
                  path: '/v2/datasets/@{encodeURIComponent(encodeURIComponent(\'${storageName}\'))}/files'
                  queries: {
                    folderPath: 'last-updated'
                    name: 'prev.json'
                    queryParametersSingleEncoded: true
                  }
                }
                runtimeConfiguration: {
                  contentTransfer: {
                    transferMode: 'Chunked'
                  }
                }
                type: 'ApiConnection'
              }
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
            'Parse Response Body of Functions App': [
              'Succeeded'
            ]
          }
          type: 'If'
        }
        'Check Notification UCS List': {
          actions: {
            'Send Mail': {
              inputs: {
                body: {
                  Body: '<p>@{body(\'Parse Response Body of Functions App\')?[\'notification\']}</p>'
                  Subject: 'New UCS List was detected! [@{workflow().run.id}]'
                  To: '@variables(\'mail\')'
                }
                host: {
                  connection: {
                    name: '@parameters(\'$connections\')[\'apiConnOutlook\'][\'connectionId\']'
                  }
                }
                method: 'post'
                path: '/v2/Mail'
              }
              type: 'ApiConnection'
            }
          }
          expression: {
            and: [
              {
                greater: [
                  '@length(body(\'Parse Response Body of Functions App\')?[\'notification\'])'
                  0
                ]
              }
            ]
          }
          runAfter: {
            'Parse Response Body of Functions App': [
              'Succeeded'
            ]
          }
          type: 'If'
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
            connectionId: resourceId('Microsoft.Web/connections', apiConnAzureblobName)
            connectionName: apiConnAzureblobName
            id: subscriptionResourceId('Microsoft.Web/locations/managedApis', location, 'azureblob')
          }
          apiConnOutlook: {
            connectionId: resourceId('Microsoft.Web/connections', apiConnOutlookName)
            connectionName: apiConnOutlookName
            id: subscriptionResourceId('Microsoft.Web/locations/managedApis', location, 'outlook')
          }
        }
      }
    }
    state: 'Enabled'
  }
}
