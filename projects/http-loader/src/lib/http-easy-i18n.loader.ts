import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EasyI18nMessages } from 'easy-i18n-js';
import { EasyI18nLoader } from '@ngx-easy-i18n-js/core';

export interface IOptions {
  /**
   * Url prefix, default '/assets/i18n/'
   */
  prefix?: string;
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
    return this.httpClient.get<EasyI18nMessages>(`${this.options.prefix ?? ''}${locale}${this.options.suffix ?? ''}`);
  }
}