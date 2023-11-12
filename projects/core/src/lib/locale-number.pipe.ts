import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { EasyI18nService } from './easy-i18n.service';
import { formatNumber } from '@angular/common';

@Pipe({
  name: 'localeNumber',
  standalone: true
})
export class LocaleNumberPipe implements PipeTransform {

  constructor(
    private easyI18nService: EasyI18nService,
    @Inject(LOCALE_ID) private localeId: string
  ) {
  }

  transform(value: number, digitsInfo?: string): string {
    return formatNumber(value, this.easyI18nService.ngLocale ?? this.localeId, digitsInfo);
  }
}
