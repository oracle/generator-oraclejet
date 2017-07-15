# generator-oraclejet 3.2.0

## About the generator
This Yeoman generator for Oracle JET lets you quickly set up a project for use as a web application or hybrid mobile application for Android, iOS or Windows 10. 

This is an open source project maintained by Oracle Corp.

## Installation
For step-by-step instructions on using Yeoman and this generator to build an Oracle JET application, including possible pre-requisites for installation, please see the [Oracle JET Developers Guide](http://docs.oracle.com/middleware/jet320/jet/)
```bash
npm install -g generator-oraclejet
```

## Usage
Once you have the generator installed, the following commands will scaffold up a JET based application. See the [Oracle JET Developers Guide](http://docs.oracle.com/middleware/jet320/jet/) for information about all of the available command line options as well as details on pre-requisites for installation.

```bash
# Generate a web application with default blank template
yo oraclejet <app name>
```
```bash
# Generate a web application with default basic template
yo oraclejet <app name> --template=basic
```
```bash
# Generate a hybrid mobile application for Android with default navdrawer template
yo oraclejet:hybrid myApp --appid=com.oracle.samples.myapp --appname=MyApp --template=navdrawer --platform=android
```

## [Contributing](https://github.com/oracle/generator-oraclejet/tree/master/CONTRIBUTING.md)
Oracle JET is an open source project.  Pull Requests are currently not being accepted. See 
[CONTRIBUTING](https://github.com/oracle/generator-oraclejet/tree/master/CONTRIBUTING.md)
for details.

## [License](https://github.com/oracle/generator-oraclejet/tree/master/LICENSE.md)
Copyright (c) 2014, 2017 Oracle and/or its affiliates
The Universal Permissive License (UPL), Version 1.0