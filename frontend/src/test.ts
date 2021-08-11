// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { ɵDomSharedStylesHost } from '@angular/platform-browser';
import { speculoosMatchers } from 'ngx-speculoos';

declare const require: any;

beforeEach(() => {
  jasmine.addMatchers(speculoosMatchers);
});

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
// https://github.com/angular/angular/issues/31834
afterEach(() => {
  getTestBed().inject(ɵDomSharedStylesHost).ngOnDestroy();
});
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
