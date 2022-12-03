import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { EasyI18nMessages } from 'easy-i18n-js';
import { EasyI18nLoader } from '@ngx-easy-i18n-js/core';
import * as lodash from 'lodash';
import { map } from 'rxjs/operators';

export interface IOptions {
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

  private options: IOptions;

  constructor(
    private httpClient: HttpClient,
    options?: IOptions
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
    if (lodash.isArray(this.options.prefix)) {
      return forkJoin(
        this.options.prefix.map(prefix =>
          this.httpClient.get<EasyI18nMessages>(`${prefix ?? ''}${locale}${this.options.suffix ?? ''}`).pipe(
            catchError(() => of({}))
          )
        )
      ).pipe(
        map(res => lodash.defaultsDeep({}, ...lodash.compact(res))),
      );
    }
    return this.httpClient.get<EasyI18nMessages>(`${this.options.prefix ?? ''}${locale}${this.options.suffix ?? ''}`);
  }
}