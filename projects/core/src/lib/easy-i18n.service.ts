import { Inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { BehaviorSubject, forkJoin, Observable, of, Subject, Subscription, switchMap } from 'rxjs';
import { EasyI18nOptions, installEasyI18n, setEasyI18nMessages } from 'easy-i18n-js';
import * as lodash from 'lodash';
import { EasyI18nLoader } from './easy-i18n.loader';
import { catchError, map, tap } from 'rxjs/operators';

export const EASY_I18N_OPTIONS = new InjectionToken<EasyI18nOptions>('EASY_I18N_OPTIONS');
export const NG_LOCALES = new InjectionToken<{ [key: string]: any; }>('NG_LOCALES');
export const USE_BROWSER_LANGUAGE = new InjectionToken<boolean>('USE_BROWSER_LANGUAGE');
export const DEFAULT_LANGUAGE = new InjectionToken<string>('DEFAULT_LANGUAGE');
export const FALLBACK_LANGUAGE = new InjectionToken<string>('FALLBACK_LANGUAGE');
export const DISCOVER = new InjectionToken<string>('DISCOVER');

export type LocaleStatus = 'none' | 'loading' | 'ready';

const cultureRegex = new RegExp('^([a-z]{2,3})(?:-([A-Z]{2,3})(?:-([a-zA-Z]{4}))?)?$');

function getPossibleLocales(culture: string | undefined, discover: 'exact' | 'minimum' | 'all'): string[] {
  if (!culture) {
    return [];
  }

  if (discover === 'exact') {
    return [culture];
  }
  const match = culture.match(cultureRegex);

  if (discover === 'minimum') {
    return lodash.compact([match?.[1]]);
  }

  return lodash.compact(lodash.uniq([match?.[0], lodash.compact([match?.[1], match?.[2]]).join('-'), match?.[1]]));
}

@Injectable()
export class EasyI18nService implements OnDestroy {

  private _localeStatusSubject = new BehaviorSubject<LocaleStatus>('none');
  private _localeSubject = new Subject<string>();

  // Get status observable of loading locale
  public get localeStatus$(): Observable<LocaleStatus> {
    return this._localeStatusSubject.asObservable();
  }

  // Get locale observable
  public get locale$(): Observable<string> {
    return this._localeSubject.asObservable();
  }

  private _currentLocale: string | null = null;

  // Current locale
  get currentLocale(): string | null {
    return this._currentLocale;
  }

  private _ngLocale: string | null = null;

  // Current Angular locale
  get ngLocale(): string | null {
    return this._ngLocale;
  }

  private subscription: Subscription;

  constructor(
    @Inject(EASY_I18N_OPTIONS) options: EasyI18nOptions,
    @Inject(NG_LOCALES) ngLocales: { [key: string]: any; },
    @Inject(USE_BROWSER_LANGUAGE) useBrowserLanguage: boolean,
    @Inject(DEFAULT_LANGUAGE) defaultLanguage: string,
    @Inject(FALLBACK_LANGUAGE) fallbackLanguage: string,
    @Inject(DISCOVER) discover: 'exact' | 'minimum' | 'all',
    private loader: EasyI18nLoader,
  ) {
    installEasyI18n(options);

    this.subscription = this._localeSubject.asObservable().pipe(
      tap(() => this._localeStatusSubject.next('loading')),
      switchMap(culture => {
        const ngLocale = getPossibleLocales(culture, 'all').find(l => ngLocales?.[l]);
        if (ngLocale != null) {
          registerLocaleData(ngLocales[ngLocale]);

          this._ngLocale = ngLocale;
        } else {
          console.warn(`Not found locale data for currentLocale ${culture}`);

          if (culture !== (fallbackLanguage ?? defaultLanguage)) {
            const defaultNgLocale = getPossibleLocales(fallbackLanguage ?? defaultLanguage, 'all').find(l => ngLocales?.[l]);
            if (defaultNgLocale != null) {
              console.warn(`Use locale data with ${fallbackLanguage ?? defaultLanguage}`);
              registerLocaleData(ngLocales[defaultNgLocale]);

              this._ngLocale = defaultNgLocale;
            } else {
              console.warn(`Not found locale data for defaultLanguage ${fallbackLanguage ?? defaultLanguage}`);

              this._ngLocale = null;
            }
          }
        }

        const locales = lodash.uniq(
          [...getPossibleLocales(culture, discover), ...getPossibleLocales(fallbackLanguage ?? defaultLanguage, discover)]
        );

        return forkJoin(
          locales.map(locale =>
            this.loader.getMessages(locale).pipe(
              catchError(() => {
                return of({});
              })
            )
          )
        ).pipe(
          map(res => lodash.defaultsDeep({}, ...lodash.compact(res))),
          tap(msg => {
            setEasyI18nMessages(msg ?? {}, culture);

            this._currentLocale = culture;
          })
        );
      }),
      tap(() => this._localeStatusSubject.next('ready')),
    ).subscribe();

    const browserCulture = this.getBrowserCulture();
    if (browserCulture) {
      const res = getPossibleLocales(browserCulture, discover);

      this.registerCulture(res?.[0] ?? browserCulture);
    } else if (defaultLanguage) {
      this.registerCulture(defaultLanguage);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Change current culture
   *
   * @param culture new culture
   */
  public registerCulture(culture: string): void {
    if (!culture || !cultureRegex.test(culture)) {
      console.error(`Culture ${culture} is wrong format`);
      return;
    }

    this._localeSubject.next(culture);
  }

  /**
   * Get browser culture
   */
  public getBrowserCulture(): string | null {
    if (typeof window === 'undefined' || typeof window.navigator === 'undefined') {
      return null;
    }

    let browserCultureLang: any = window.navigator.languages ? window.navigator.languages[0] : null;
    return browserCultureLang ?? window.navigator.language ??
      (window.navigator as any).browserLanguage ?? (window.navigator as any).userLanguage;
  }
}
