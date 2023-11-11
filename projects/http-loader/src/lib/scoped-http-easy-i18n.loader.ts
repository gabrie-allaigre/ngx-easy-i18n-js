import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { EasyI18nMessages } from 'easy-i18n-js';
import { EasyI18nLoader } from '@ngx-easy-i18n-js/core';
import * as lodash from 'lodash';
import { map } from 'rxjs/operators';
import { HttpEasyI18nLoader } from './http-easy-i18n.loader';
import { prefix } from 'concurrently/dist/src/defaults';

export interface IScope {
  /**
   * Url prefix, Array of prefix
   */
  prefix: string | string[];
  /**
   * Alias
   */
  scope: string;
}

export interface IOptions {
  /**
   * Url suffix, default '.json'
   */
  suffix?: string;
}

export class ScopedHttpEasyI18nLoader extends EasyI18nLoader {

  private readonly list: { loader: EasyI18nLoader; scope: string; }[];

  constructor(
    readonly httpClient: HttpClient,
    readonly scopes: IScope[],
    readonly options?: IOptions
  ) {
    super();

    this.list = scopes.map(s => ({
      loader: new HttpEasyI18nLoader(httpClient, {
        prefix: s.prefix,
        suffix: options?.suffix ?? '.json'
      }),
      scope: s.scope
    }));
  }

  override getMessages(locale: string): Observable<EasyI18nMessages> {
    return forkJoin(
      this.list.map(l => l.loader.getMessages(locale).pipe(
        map(res => {
          if (!l.scope) {
            return res;
          }
          return lodash.set({}, l.scope, res)
        })
      ))
    ).pipe(
      map(datas => lodash.defaultsDeep({}, ...lodash.compact(datas)))
    );
  }
}