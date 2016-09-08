import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { AppComponent, environment } from './app/';
import { HTTP_PROVIDERS } from '@angular/http';
import { APP_ROUTE_PROVIDER } from './app/app.route';

if (environment.production) {
  enableProdMode();
}



bootstrap(AppComponent, [HTTP_PROVIDERS, APP_ROUTE_PROVIDER])
  .catch(error => console.error(error));
