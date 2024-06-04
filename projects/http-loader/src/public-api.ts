import { Provider } from '@angular/core';
import { EasyI18nLoader } from '@ngx-easy-i18n-js/core';
import { HttpClient } from '@angular/common/http';
import { HttpEasyI18nLoader, IHttpEasyI18nLoaderOptions } from './lib/http-easy-i18n.loader';

export * from './lib/http-easy-i18n.loader';
export * from './lib/scoped-http-easy-i18n.loader';

export function provideEasyI18nLoader(options?: IHttpEasyI18nLoaderOptions): Provider[] {
  return [
    {
      provide: EasyI18nLoader,
      deps: [HttpClient],
      useFactory: (httpClient: HttpClient) => new HttpEasyI18nLoader(httpClient, options)
    }
  ]
}