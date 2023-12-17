import { APP_INITIALIZER, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { LocaleDatePipe } from './lib/locale-date.pipe';
import { LocaleNumberPipe } from './lib/locale-number.pipe';
import { TrDirective } from './lib/tr.directive';
import { TrPipe } from './lib/tr.pipe';
import { PluralPipe } from './lib/plural.pipe';
import { PluralDirective } from './lib/plural.directive';
import { LocalePercentPipe } from './lib/locale-percent.pipe';
import { LocaleCurrencyPipe } from './lib/locale-currency.pipe';
import { EasyI18nOptions } from 'easy-i18n-js';
import {
  DEFAULT_LANGUAGE,
  DISCOVER,
  EASY_I18N_OPTIONS,
  EasyI18nService,
  FALLBACK_LANGUAGE,
  NG_LOCALES,
  USE_BROWSER_LANGUAGE
} from './lib/easy-i18n.service';
import { EasyI18nLoader, EmptyEasyI18nLoader } from './lib/easy-i18n.loader';
import { PluralContentDirective, PluralElementDirective } from './lib/plural-content.directive';
import { TrContentDirective, TrElementDirective } from './lib/tr-content.directive';
import { EasyI18nStore, EmptyEasyI18nStore } from './lib/easy-i18n.store';
import { firstValueFrom } from 'rxjs';

export * from './lib/locale-date.pipe';
export * from './lib/locale-number.pipe';
export * from './lib/locale-percent.pipe';
export * from './lib/locale-currency.pipe';
export * from './lib/tr.pipe';
export * from './lib/plural.pipe';
export * from './lib/tr.directive';
export * from './lib/tr-content.directive';
export * from './lib/plural.directive';
export * from './lib/plural-content.directive';
export * from './lib/easy-i18n.loader';
export * from './lib/easy-i18n.store';
export * from './lib/easy-i18n.service';

export interface EasyI18nModuleConfig {
  /**
   * Options fo easy i18 js library
   */
  options?: EasyI18nOptions;
  /**
   * Use specific loader
   */
  loader?: Provider;
  /**
   * Use specific store
   */
  store?: Provider;
  /**
   * Use specific loader
   */
  ngLocales?: { [key: string]: any; };
  /**
   * Use browser language
   */
  useBrowserLanguage?: boolean;
  /**
   * Default language use if no use browser language
   */
  defaultLanguage?: string;
  /**
   * Fallback language use if current language not found
   */
  fallbackLanguage?: string;
  /**
   * <code>exact</code> only fr-FR, <code>minimum</code> only fr, <code>all</code> fr-FR and fr
   */
  discover?: 'exact' | 'minimum' | 'all';
}

@NgModule({
  imports: [
    LocaleDatePipe,
    LocaleNumberPipe,
    TrDirective,
    TrPipe,
    PluralPipe,
    PluralDirective,
    LocalePercentPipe,
    LocaleCurrencyPipe,
    PluralElementDirective,
    PluralContentDirective,
    TrElementDirective,
    TrContentDirective
  ],
  exports: [
    LocaleDatePipe,
    LocaleNumberPipe,
    TrDirective,
    TrPipe,
    PluralPipe,
    PluralDirective,
    LocalePercentPipe,
    LocaleCurrencyPipe,
    PluralElementDirective,
    PluralContentDirective,
    TrElementDirective,
    TrContentDirective
  ]
})
export class EasyI18nModule {

  /**
   * Use this method in your root module to provide the EasyI18nService
   */
  static forRoot(config: EasyI18nModuleConfig): ModuleWithProviders<EasyI18nModule> {
    return {
      ngModule: EasyI18nModule,
      providers: [
        config.loader || { provide: EasyI18nLoader, useClass: EmptyEasyI18nLoader },
        config.store || { provide: EasyI18nStore, useClass: EmptyEasyI18nStore },
        { provide: EASY_I18N_OPTIONS, useValue: config.options },
        { provide: NG_LOCALES, useValue: config.ngLocales },
        { provide: USE_BROWSER_LANGUAGE, useValue: config.useBrowserLanguage ?? true },
        { provide: DEFAULT_LANGUAGE, useValue: config.defaultLanguage ?? 'en-US' },
        { provide: FALLBACK_LANGUAGE, useValue: config.fallbackLanguage },
        { provide: DISCOVER, useValue: config.discover ?? 'all' },
        EasyI18nService,
        {
          provide: APP_INITIALIZER,
          useFactory: (easyI18nService: EasyI18nService) => {
            return async () =>
              easyI18nService.initialize()
          },
          deps: [EasyI18nService],
          multi: true
        }
      ]
    };
  }
}
