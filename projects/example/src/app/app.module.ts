import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import { EasyI18nLoader, EasyI18nModule } from '@ngx-easy-i18n-js/core';
import { EasyI18nBootstrapComponent, EasyI18nBootstrapModule } from '@ngx-easy-i18n-js/bootstrap';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HttpEasyI18nLoader } from '../../../http-loader/src/lib/http-easy-i18n.loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const LANGUAGES: { code: string; ngLocale: any; flag: string; name: string; }[] = [
  { code: 'fr', ngLocale: localeFr, flag: 'fr', name: 'Français' },
  { code: 'en', ngLocale: localeEn, flag: 'gb', name: 'English' }
];

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    EasyI18nModule.forRoot({
      options: {
        logging: false
      },
      ngLocales: LANGUAGES.reduce((acc, x) => {
        acc[x.code] = x.ngLocale;
        return acc;
      }, {} as { [key: string]: any; }),
      defaultLanguage: 'fr',
      fallbackLanguage: 'en',
      discover: 'minimum'
    }),
    EasyI18nBootstrapModule.forRoot({
      bootstrap: AppComponent
    }),
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    {
      provide: EasyI18nLoader,
      deps: [HttpClient],
      useFactory: (httpClient: HttpClient) => new HttpEasyI18nLoader(httpClient, {
        prefix: '/assets/i18n/'
      })
    }
  ],
  bootstrap: [EasyI18nBootstrapComponent]
})
export class AppModule {
}
