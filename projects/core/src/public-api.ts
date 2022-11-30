import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { LocaleDatePipe } from './lib/locale-date.pipe';
import { LocaleNumberPipe } from './lib/locale-number.pipe';
import { TrDirective } from './lib/tr.directive';
import { TrPipe } from './lib/tr.pipe';
import { PluralPipe } from './lib/plural.pipe';
import { PluralDirective } from './lib/plural.directive';
import { LocalePecentPipe } from './lib/locale-percent.pipe';
import { LocaleCurrencyPipe } from './lib/locale-currency.pipe';
import { EasyI18nOptions } from 'easy-i18n-js';
import {
  DEFAULT_LANGUAGE,
  EASY_I18N_OPTIONS,
  EasyI18nService,
  NG_LOCALES,
  ONLY_EXACT_LANGUAGE,
  USE_BROWSER_LANGUAGE
} from './lib/easy-i18n.service';
import { EasyI18nLoader, EmptyEasyI18nLoader } from './lib/easy-i18n.loader';

export * from './lib/locale-date.pipe';
export * from './lib/locale-number.pipe';
export * from './lib/locale-percent.pipe';
export * from './lib/locale-currency.pipe';
export * from './lib/tr.pipe';
export * from './lib/plural.pipe';
export * from './lib/tr.directive';
export * from './lib/plural.directive';
export * from './lib/easy-i18n.loader';
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
   * Use specific loader
   */
  ngLocales?: { [key: string]: any; };
  /**
   * Use browser language
   */
  useBrowserLanguage?: boolean;
  /**
   * Default fallback language use if current language not found
   */
  defaultLanguage?: string;
  /**
   * Use exact language (default false) if false, fr-FR and fr
   */
  onlyExactLanguage?: boolean;
}

@NgModule({
  declarations: [
    LocaleDatePipe,
    LocaleNumberPipe,
    TrDirective,
    TrPipe,
    PluralPipe,
    PluralDirective,
    LocalePecentPipe,
    LocaleCurrencyPipe
  ],
  exports: [
    LocaleDatePipe,
    LocaleNumberPipe,
    TrDirective,
    TrPipe,
    PluralPipe,
    PluralDirective,
    LocalePecentPipe,
    LocaleCurrencyPipe
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
        { provide: EASY_I18N_OPTIONS, useValue: config.options },
        { provide: NG_LOCALES, useValue: config.ngLocales },
        { provide: USE_BROWSER_LANGUAGE, useValue: config.useBrowserLanguage ?? true },
        { provide: DEFAULT_LANGUAGE, useValue: config.defaultLanguage ?? 'en-US' },
        { provide: ONLY_EXACT_LANGUAGE, useValue: config.onlyExactLanguage ?? false },
        EasyI18nService
      ]
    };
  }
}
