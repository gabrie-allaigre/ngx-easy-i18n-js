import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { EasyI18nService } from './easy-i18n.service';
import { formatPercent } from '@angular/common';

@Pipe({
  name: 'localePercent',
  standalone: true
})
export class LocalePercentPipe implements PipeTransform {

  constructor(
    private easyI18nService: EasyI18nService,
    @Inject(LOCALE_ID) private localeId: string
  ) {
  }

  transform(value: number, digitsInfo?: string): string {
    return formatPercent(value, this.easyI18nService.ngLocale ?? this.localeId, digitsInfo);
  }
}
