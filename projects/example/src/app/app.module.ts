import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import { EasyI18nModule } from '@ngx-easy-i18n-js/core';
import { EasyI18nBootstrapComponent } from '@ngx-easy-i18n-js/bootstrap';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideEasyI18nBootstrap } from '../../../bootstrap/src/public-api';
import { provideEasyI18n } from '../../../core/src/public-api';
import { provideEasyI18nLoader } from '../../../http-loader/src/public-api';

export const LANGUAGES: { code: string; ngLocale: any; flag: string; name: string; }[] = [
  { code: 'fr', ngLocale: localeFr, flag: 'fr', name: 'Français' },
  { code: 'en', ngLocale: localeEn, flag: 'gb', name: 'English' }
];

@NgModule({
  declarations: [
    AppComponent
  ],
  bootstrap: [EasyI18nBootstrapComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    EasyI18nModule,
    AppRoutingModule
  ],
  providers: [
    provideEasyI18nLoader({
      prefix: '/assets/i18n/'
    }),
    provideHttpClient(withInterceptorsFromDi()),
    provideEasyI18n({
      options: {
        logging: false
      },
      ngLocales: LANGUAGES.reduce((acc, x) => {
        acc[x.code] = x.ngLocale;
        return acc;
      }, {} as {
        [key: string]: any;
      }),
      defaultLanguage: 'fr',
      fallbackLanguage: 'en',
      discover: 'minimum'
    }),
    provideEasyI18nBootstrap({
      bootstrap: AppComponent
    })
  ]
})
export class AppModule {
}
