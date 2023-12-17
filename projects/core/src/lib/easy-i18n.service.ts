import { Inject, Injectable, InjectionToken } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { BehaviorSubject, filter, firstValueFrom, forkJoin, Observable, of, Subject, switchMap } from 'rxjs';
import { EasyI18nOptions, installEasyI18n, setEasyI18nMessages } from 'easy-i18n-js';
import * as lodash from 'lodash';
import { EasyI18nLoader } from './easy-i18n.loader';
import { catchError, map, tap } from 'rxjs/operators';
import { EasyI18nStore } from './easy-i18n.store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EasyI18nMessages } from 'easy-i18n-js/lib/easy-i18n';

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
export class EasyI18nService {

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

  private readonly otherLoaders: EasyI18nLoader[] = [];

  private currentMsg: EasyI18nMessages = {};

  constructor(
    @Inject(EASY_I18N_OPTIONS) options: EasyI18nOptions,
    @Inject(NG_LOCALES) ngLocales: { [key: string]: any; },
    @Inject(USE_BROWSER_LANGUAGE) useBrowserLanguage: boolean,
    @Inject(DEFAULT_LANGUAGE) private defaultLanguage: string,
    @Inject(FALLBACK_LANGUAGE) private fallbackLanguage: string,
    @Inject(DISCOVER) private discover: 'exact' | 'minimum' | 'all',
    private loader: EasyI18nLoader,
    private store: EasyI18nStore
  ) {
    installEasyI18n(options);

    this._localeSubject.asObservable().pipe(
      takeUntilDestroyed(),
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
          locales.flatMap(locale =>
            [
              this.loader.getMessages(locale).pipe(
                catchError(() => {
                  return of({});
                })
              ),
              ...this.otherLoaders.map(l =>
                l.getMessages(locale).pipe(
                  catchError(() => {
                    return of({});
                  })
                )
              )
            ]
          )
        ).pipe(
          map(res => lodash.defaultsDeep({}, ...lodash.compact(res))),
          tap(msg => {
            this.currentMsg = msg ?? {};

            setEasyI18nMessages(this.currentMsg, culture);

            this._currentLocale = lodash.head(locales) ?? culture;
          })
        );
      }),
      tap(() => this._localeStatusSubject.next('ready')),
    ).subscribe();

    this.store.get().pipe(
      tap(stored => {
        const culture = stored ?? this.getBrowserCulture() ?? defaultLanguage;
        if (!culture || !cultureRegex.test(culture)) {
          console.error(`Culture ${culture} is wrong format`);
          return;
        }
        this._localeSubject.next(culture);
      })
    ).subscribe();
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

    this.store.save(culture);

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

  public async appendLoader(loader: EasyI18nLoader) {
    this.otherLoaders.push(loader);

    return firstValueFrom(this._localeStatusSubject.asObservable().pipe(
      filter(s => s === 'ready'),
      switchMap(() => {
        const locales = lodash.uniq(
          [...getPossibleLocales(this._currentLocale!, this.discover), ...getPossibleLocales(this.fallbackLanguage ?? this.defaultLanguage, this.discover)]
        );

        return forkJoin(
          locales.map(locale =>
            loader.getMessages(locale).pipe(
              catchError(() => {
                return of({});
              })
            )
          )
        ).pipe(
          map(res => lodash.defaultsDeep(this.currentMsg, ...lodash.compact(res))),
          tap(msg => {
            setEasyI18nMessages(msg, this._currentLocale!);
          }),
          map(() => true)
        )
      })
    ), {
      defaultValue: false
    });
  }
}
