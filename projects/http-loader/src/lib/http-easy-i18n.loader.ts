import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { EasyI18nMessages } from 'easy-i18n-js';
import { EasyI18nLoader } from '@ngx-easy-i18n-js/core';
import * as lodash from 'lodash';
import { map } from 'rxjs/operators';

export interface IHttpEasyI18nLoaderOptions {
  /**
   * Url prefix, default '/assets/i18n/' or Array of prefix
   */
  prefix?: string | string[];
  /**
   * Url suffix, default '.json'
   */
  suffix?: string;
}

export class HttpEasyI18nLoader extends EasyI18nLoader {

  private options: IHttpEasyI18nLoaderOptions;

  constructor(
    private httpClient: HttpClient,
    options?: IHttpEasyI18nLoaderOptions
  ) {
    super();

    this.options = {
      prefix: '/assets/i18n/',
      suffix: '.json',
      ...(options ?? {})
    };
  }

  /**
   * Return messages with locale with HttpClient `${this.options.prefix ?? ''}${locale}${this.options.suffix ?? ''}`
   * @param locale
   */
  getMessages(locale: string): Observable<EasyI18nMessages> {
    const prefix = lodash.isArray(this.options.prefix) ? this.options.prefix : [this.options.prefix];
    return forkJoin(
      prefix.map(p => {
          const url = `${p ?? ''}${locale}${this.options.suffix ?? ''}`;
          return this.httpClient.get<EasyI18nMessages>(url).pipe(
            catchError((err) => {
              console.error(`Failed to load file ${url}`, err);
              return of({});
            })
          );
        }
      )
    ).pipe(
      map(res => lodash.defaultsDeep({}, ...lodash.compact(res))),
    );
  }
}
