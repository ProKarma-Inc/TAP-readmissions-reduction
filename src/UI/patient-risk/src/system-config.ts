"use strict";

// SystemJS configuration file, see links for more information
// https://github.com/systemjs/systemjs
// https://github.com/systemjs/systemjs/blob/master/docs/config-api.md

/***********************************************************************************************
 * User Configuration.
 **********************************************************************************************/
/** Map relative paths to URLs. */
const map: any = {
};

/** User packages configuration. */
const packages: any = {
};

////////////////////////////////////////////////////////////////////////////////////////////////
/***********************************************************************************************
 * Everything underneath this line is managed by the CLI.
 **********************************************************************************************/
const barrels: string[] = [
  // Angular specific barrels.
  '@angular/core',
  '@angular/common',
  '@angular/compiler',
  '@angular/forms',
  '@angular/http',
  '@angular/router',
  '@angular/platform-browser',
  '@angular/platform-browser-dynamic',

  // Thirdparty barrels.
  'rxjs',
  'angular2-highcharts',

  // App specific barrels.
  'app',
  'app/shared',
  'app/header',
  'app/patient-select',
  'app/patient-select/discharge-population',
  'app/patient-select/filter-population-by',
  'app/patient-select/proportion-at-risk',
  'app/readmission-risk-results',
  'app/dropdown',
  'app/services',
  'app/models',
  'app/risk-legend',
  /** @cli-barrel */
];

const chartingBarrels: string[] = [
  'highcharts',
];


const cliSystemConfigPackages: any = {};
barrels.forEach((barrelName: string) => {
  cliSystemConfigPackages[barrelName] = { main: 'index' };
});

chartingBarrels.forEach((barrelName5: string) => {
  cliSystemConfigPackages[barrelName5] = { main: 'highcharts' };
});


/** Type declaration for ambient System. */
declare var System: any;

// Apply the CLI SystemJS configuration.
System.config({
  map: {
    '@angular': 'vendor/@angular',
    'rxjs': 'vendor/rxjs',
    'main': 'main.js',
    'highcharts': 'vendor/highcharts',
    'angular2-highcharts': 'vendor/angular2-highcharts'
  },
  packages: cliSystemConfigPackages
});

// Apply the user's configuration.
System.config({ map, packages });
