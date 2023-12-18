import { defer, Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';

export abstract class EasyI18nStore {
  /**
   * Return stored culture
   */
  public abstract get(): Observable<string | null>;

  public abstract save(locale: string): Observable<boolean>;
}

/**
 * This store, get stored culture
 */
@Injectable()
export class EmptyEasyI18nStore extends EasyI18nStore {

  public override get(): Observable<string | null> {
    return of(null);
  }

  public override save(locale: string): Observable<boolean> {
    return of(true);
  }
}

/**
 * Use localStorage
 */
export class LocalStorageEasyI18nStore extends EasyI18nStore {

  constructor(
    private readonly key: string
  ) {
    super();
  }

  public override get(): Observable<string | null> {
    return defer(() => of(localStorage.getItem(this.key)));
  }

  public override save(locale: string): Observable<boolean> {
    return defer(() => {
      localStorage.setItem(this.key, locale);
      return of(true);
    });
  }
}