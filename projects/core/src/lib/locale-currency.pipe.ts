import { DEFAULT_CURRENCY_CODE, Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { EasyI18nService } from './easy-i18n.service';
import { formatCurrency, getCurrencySymbol } from '@angular/common';

@Pipe({
  name: 'localeCurrency',
  standalone: true
})
export class LocaleCurrencyPipe implements PipeTransform {

  constructor(
    private easyI18nService: EasyI18nService,
    @Inject(LOCALE_ID) private localeId: string,
    @Inject(DEFAULT_CURRENCY_CODE) private defaultCurrencyCode: string = 'USD'
  ) {
  }

  transform(value: number, currencyCode?: string, display: 'symbol' | 'symbol-narrow' | 'code' | string = 'symbol', digitsInfo?: string): string {
    const locale = this.easyI18nService.ngLocale ?? this.localeId;

    let currency: string = currencyCode ?? this.defaultCurrencyCode;
    if (display !== 'code') {
      if (display === 'symbol' || display === 'symbol-narrow') {
        currency = getCurrencySymbol(currency, display === 'symbol' ? 'wide' : 'narrow', locale);
      } else {
        currency = display;
      }
    }
    return formatCurrency(value, locale, currency, currencyCode, digitsInfo);
  }
}
