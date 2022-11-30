import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { EasyI18nService } from './easy-i18n.service';
import { formatCurrency } from '@angular/common';

@Pipe({
  name: 'localeCurrency'
})
export class LocaleCurrencyPipe implements PipeTransform {

  constructor(
    private easyI18nService: EasyI18nService,
    @Inject(LOCALE_ID) private localeId: string
  ) {
  }

  transform(value: number, format: string, currency: string, currencyCode?: string, digitsInfo?: string): string {
    return formatCurrency(value, this.easyI18nService.ngLocale ?? this.localeId, currency, currencyCode, digitsInfo);
  }
}
