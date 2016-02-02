# generator-oraclejet 1.0.0

## About the generator
This Yeoman generator for Oracle JET lets you quickly set up a project for use as a Web application or mobile-hybrid application for Android and iOS. 

This is an open source project maintained by Oracle Corp.

### Installation
For step-by-step instructions on using Yeoman and this generator to build an Oracle JET application, including possible pre-requisites for installation, please see the [Oracle JET Developers Guide](http://docs.oracle.com/middleware/jet200/jet/)
```bash
npm install -g generator-oraclejet
```

### Usage
Once you have the generator installed, the following commands will scaffold up a JET based application. See the [Oracle JET Developers Guide](http://docs.oracle.com/middleware/jet200/jet/) for information about all of the available Command Line options as well as details on pre-requisites for installation and usage with Mobile-Hybrid applications.

```bash
# Generate a web based application with default blank template
yo oraclejet <app name>
```
```bash
# Generate a web based application with QuickStart_Basic template
yo oraclejet <app name> --template=basic
```
```bash
# Generate a mobile hybrid application for Android with default navDrawer template
yo oraclejet:hybrid myApp --appId=com.oracle.samples --appName=MyApp --template=navDrawer --platforms=android
```

### [Contributing](https://github.com/oracle/generator-oraclejet/tree/master/CONTRIBUTING.md)
Oracle JET is an open source project. See 
[CONTRIBUTING](https://github.com/oracle/generator-oraclejet/tree/master/CONTRIBUTING.md)
for details.

### [License](https://github.com/oracle/generator-oraclejet/tree/master/LICENSE.md)
Copyright (c) 2014, 2016 Oracle and/or its affiliates
The Universal Permissive License (UPL), Version 1.0