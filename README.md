# Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`package.json` | project metadata and configuration
`readme.md` | this getting started guide


## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start adding content, for example, a [db/schema.cds](db/schema.cds).


## Learn More

Learn more at https://cap.cloud.sap/docs/get-started/.


- npm install -g npm@latest 
- o npm i -g @sap/cds-dk or npm update --global @sap/cds-dk
- npm install @sap/textbundle
- npm install @sap-cloud-sdk/http-client
- npm install @sap-cloud-sdk/resilience

## Create new project

- cds init
- cds add hana,mta,xsuaa --for production  (hana only if database is required)
- npm update --package-lock-only

## Optional Libraries

- npm install node-cache
- npm install fast-sort
- npm install decimal.js
- npm install moment

## BTP Deployment

- mbt build
- cf login
- cf deploy mta_archives/cap-service-template_1.0.0.mtar

## Execute

- cds watch
- cds watch --profile development (for development only  - defined package.json)
- cds watch --profile hybrid ==> (execute the default-env.json when using sap btp destinations VCAP_SERVICES)

## Enviroment variables

A new .env file must be created : default-env.json

Example:
{
  "DEMO_CUSTOM_VARIABLE": "This is a CUSTOM_VARIABLE"
}

## Security

Examples:
@(requires: 'any')
@(requires: 'Admin')
@(requires: 'Consumer')

Execute:

cds compile srv --to xsuaa > xs-security.json

## External Access

(1) Create the Service Key for the xxx-service-auth 
(2) Access with oAuth2 by Client_Id and Client_Secret