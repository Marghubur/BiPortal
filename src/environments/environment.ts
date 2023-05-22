// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  env: "local",
  OAuthClientId: "1084985264281-ehe21udg412eesl9p6uhksoh3s2r8d0c.apps.googleusercontent.com",
  OAuthSecret: "7pxr3O8iM4SVSs8ozTC5tXts",

  // baseDotNetUrl: "http://localhost:5000/api/",
  // baseSpringUrl: "http://localhost:8090/api/",

  baseDotNetUrl: "http://tracker.io/dn/api/",
  baseSpringUrl: "http://tracker.io/sb/api/eps/",

  FolderDelimiter: "\\"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
