## Release Notes for generator-oraclejet ##

### 5.1.0
* No changes

### 5.0.0
* No changes

### 4.2.0
* No changes

### 4.1.0
* No changes

### 4.0.0
* Moved module into @oracle scope, changing the name to @oracle/generator-oraclejet
* This module should no longer be installed directly.  Use @oracle/ojet-cli instead for scaffolding JET apps.

### 3.2.0
* No changes

### 3.1.0
* No changes

### 3.0.0
* Replaced bower with npm
* SASS tasks now run in CCA directories also
* Added --destination=server-only option for web apps
* Removed --destination=deviceOrEmulatorName option
* Added ability to cutomize serve tasks such as watching additional files
* Added gap://ready to inserted CSP meta tag for iOS 10 compatibility
* Requires Node.js v4.0.0+ and npm v3.0.0+
* Known issue: grunt serve to iOS device requires developer profile

### 2.3.0
* Allow local files as scaffolding starting templates
* Provide the ability to specify the Windows hybrid platform architecture
* Better handling for determining which browser is launched when serving a hybrid app
* Please use the latest version of yeoman as some earlier versions can cause issues with scaffolding

### 2.2.0

* Provide help page for generator
