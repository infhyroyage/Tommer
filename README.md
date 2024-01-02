# Tommer

[![Create Azure Resources](https://github.com/infhyroyage/Tommer/actions/workflows/create-azure-resources.yaml/badge.svg)](https://github.com/infhyroyage/Tommer/actions/workflows/create-azure-resources.yaml)
[![Scan Javascript/Typescript by CodeQL](https://github.com/infhyroyage/Tommer/actions/workflows/scan-codeql.yaml/badge.svg)](https://github.com/infhyroyage/Tommer/actions/workflows/scan-codeql.yaml)
![coverage](https://infhyroyage.github.io/Tommer/badges.svg)

## Getting Started

### 1. Activate Services

1. Sign up the following two services:
   - [Microsoft Azure](https://azure.microsoft.com) activated with a Microsoft Entra tenant and an Azure subscription.
   - [GitHub](https://github.com)
2. Copy a Microsoft Entra tenant ID and a Azure subscription ID by [official reference](https://learn.microsoft.com/en-us/azure/azure-portal/get-subscription-tenant-id).

### 2. Publish Service Principal and Secret

1. Access [Azure Portal](https://portal.azure.com) and search Microsoft Entra ID:
   ![publish-service-principal-1](./docs/getting-started/publish-service-principal-1.png)
2. Access App Registrations > New registration.
3. Register a service principal by setting the any name and click "Register" button:
   ![publish-service-principal-2](./docs/getting-started/publish-service-principal-2.png)
4. Copy "Application (client) ID" of a registered service principal in the overview.
5. Access Certificates & secrets > New client secret.
6. Register a client secret of a registered service principal by setting the any description and expires and click "Add" button
7. Copy a client secret value:
   ![publish-service-principal-3](./docs/getting-started/publish-service-principal-3.png)

> [!WARNING]
> A client secret value is only displayed immediately after the registration, so keep a copied one at hand.

### 3. Grant Service Principal to Deploy Azure Resources

1. Access [Azure Portal](https://portal.azure.com) and access "Subscription" of "Navigate":
   ![grant-service-principal-1](./docs/getting-started/grant-service-principal-1.png)
2. Access the Azure subscription > Access control (IAM) > Add role assignment.
3. Select "Privileged administrator roles" tab and "Contributor" role, then click "Next" button:
   ![grant-service-principal-2](./docs/getting-started/grant-service-principal-2.png)
4. Select "User, group, or service principal" in "Assign access to", click "Select Members", set and select the name of a service principal, click "Select" button and click "Review + assign" button:
   ![grant-service-principal-3](./docs/getting-started/grant-service-principal-3.png)
5. Click "Review + assign" button.

### 4. Set GitHub Repository

1. Fork this Repository.
2. Access Setting > Secrets And variables > Actions.
3. Click the "New repository secret" button from the "Secrets" tab and set all secrets as follows:
   | Name | Value |
   | ---- | ----- |
   | `AZURE_AD_SP_CONTRIBUTOR_CLIENT_SECRET` | Copied client secret value of service principal |
4. Click the "New repository variable" button from the "Variables" tab and set all variables as follows:
   | Name | Value |
   | ---- | ----- |
   | `AZURE_AD_SP_CONTRIBUTOR_CLIENT_ID` | Copied client ID of service principal |
   | `AZURE_API_CONNECTION_AZUREBLOB` | Name of Azure API Connection with BLOB Storage |
   | `AZURE_API_CONNECTION_OUTLOOK` | Name of Azure API Connection with Outlook.com |
   | `AZURE_APPLICATION_INSIGHTS` | Name of Azure Application Insights |
   | `AZURE_FUNCTIONS` | Name of Azure Function Apps |
   | `AZURE_FUNCTIONS_PLAN` | Name of Azure Function Apps' Plan |
   | `AZURE_LOCATION` | Region of all Azure resources |
   | `AZURE_LOGIC_APP` | Name of Azure Logic Apps |
   | `AZURE_RESOURCE_GROUP` | Name of Azure Resource Group |
   | `AZURE_STORAGE` | Globally unique Name of Azure Storage Account |
   | `AZURE_SUBSCRIPTION_ID` | Copied Azure subscription ID |
   | `AZURE_TENANT_ID` | Copied Microsoft Entra tenant ID |
5. Access Actions and run "Create Azure Resources" workflow.

> [!WARNING]
> After running "Create Azure Resources" workflow, charges will be incurred on Microsoft Azure due to the deployment of Azure resources.

### 5. Update Azure Logic Apps

1. Access [Azure Portal](https://portal.azure.com) and search Logic Apps:
   ![update-azure-logic-apps-1.png](./docs/getting-started/update-azure-logic-apps-1.png)
2. Access `AZURE_LOGIC_APP` > Logic app designer.
3. Expand boxes named "Set mail" and "Set makers".
4. Set values as follows:
   ![update-azure-logic-apps-2.png](./docs/getting-started/update-azure-logic-apps-2.png)
   | Name | Description | Example |
   | ---- | ----------- | ------- |
   | Set mail | Notification mail destination when new UCS was changed | `foo@bar.com` |
   | Set makers | An array of the UCS maker names as double-quated strings which you trace and notificate | `["foo", "bar"]` |
5. Expand box named "Check Notification UCS List" > "True" > "Connections" and check the following error message:
   ![update-azure-logic-apps-3.png](./docs/getting-started/update-azure-logic-apps-3.png)
6. Click the "Invalid" column icon and authentificate by Microsoft Azure account in the new dialog.
7. Check vanishing the error message and the "Invalid" column icon:
   ![update-azure-logic-apps-4.png](./docs/getting-started/update-azure-logic-apps-4.png)
8. Click "Save" button.
9. Access Overview > Run and click "Run":
   ![update-azure-logic-apps-5.png](./docs/getting-started/update-azure-logic-apps-5.png)
10. After a while, click "Refresh" and check if the latest "Runs History" status is "Succeeded":
    ![update-azure-logic-apps-6.png](./docs/getting-started/update-azure-logic-apps-6.png)

## Development

See [Developer's Guide](./docs/DEVELOPMENT.md)

## License

[MIT](LICENSE)
