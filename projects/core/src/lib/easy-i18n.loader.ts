import { Observable, of } from 'rxjs';
import { EasyI18nMessages } from 'easy-i18n-js/lib/easy-i18n';
import { Injectable } from '@angular/core';

export abstract class EasyI18nLoader {
  /**
   * Return messages with locale
   * @param locale
   */
  public abstract getMessages(locale: string): Observable<EasyI18nMessages>;
}

/**
 * This loader is just a placeholder that does nothing, in case you don't need a loader at all
 */
@Injectable()
export class EmptyEasyI18nLoader extends EasyI18nLoader {

  public getMessages(locale: string): Observable<EasyI18nMessages> {
    return of({});
  }
}