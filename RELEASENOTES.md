## Release Notes for generator-oraclejet ##

### 3.0.0
* Replaced bower with npm
* SASS tasks now run in CCA directories also
* Added --destination=server-only option for web apps
* Removed --destination=deviceOrEmulatorName option
* Added ability to cutomize serve tasks such as watching additional files
* Added gap://ready to inserted CSP meta tag for iOS 10 compatibility
* Requires Node.js v4.0.0+ and npm v3.0.0+
* Known issue: grunt serve to iOS device requires developer profile
