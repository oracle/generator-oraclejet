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

### Release Notes
* Invoking 'grunt serve:release' may attempt to deploy an unsigned APK file, which fails. This will occur if you have an unsigned APK file in your build outputs directory, because the underlying call to 'cordova run' attempts to install the first APK file located in that directory.  
**Solution:** Remove the unsigned APK file before invoking 'grunt serve:release'.  
* Invoking 'grunt build' may cause corruption of `<button>` tags whereby `<button></button>` is changed to `<button />` which in turn may lead to the page not displaying correctly.  
**Solution:** Invoke 'grunt serve' then modify the `<button>` tags manually.  
* Warning message 'No Content-Security-Policy meta tag found' displayed repeatedly in Chrome debugger, due to there being no Content-Security-Policy meta tag in the index.html file. This meta tag is required by the Cordova whitelist plugin that is included in Cordova apps by default.  
**Solution:** Add `<meta http-equiv="Content-Security-Policy"/>`  tag manually to the index.html file.
* Invoking 'grunt build' may lead to an error message that Android API 23 is required. By default, apps built using cordova-android@5.1 target API 23 and therefore require Android API 23 to be installed, however the Cordova documentation for this release states that you need to install API 22.  
**Solution:** Install Android API 23 if you have cordova-android@5.1 installed.
* Android 6 (API 23) emulator may crash or freeze following 'grunt serve' the first time. This appears to be a known issue with the Android emulator.  
**Solution:** Setting "Use host GPU" may help, but running 'grunt serve' a second time should be successful.
* Invoking 'yo oraclejet:hybrid' to scaffold a JET hybrid app on Oracle Enterprise Linux (OEL) 6 may fail if you have Android Platform-tools v23.1.0 installed. This happens because Android Platform-tools now requires GNU C Library (glibc) 2.15 or later, which is not available on OEL 6.  
**Solution:** Either upgrade to OEL 7 or install an earlier version of Android Platform-tools, which would mean that you cannot target or emulate Android 6.0.

### [Contributing](https://github.com/oracle/generator-oraclejet/tree/master/CONTRIBUTING.md)
Oracle JET is an open source project. Pull Requests are currently not being accepted. See 
[CONTRIBUTING](https://github.com/oracle/generator-oraclejet/tree/master/CONTRIBUTING.md)
for details.

### [License](https://github.com/oracle/generator-oraclejet/tree/master/LICENSE.md)
Copyright (c) 2014, 2016 Oracle and/or its affiliates
The Universal Permissive License (UPL), Version 1.0