import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { EasyI18nService } from './easy-i18n.service';
import { formatDate } from '@angular/common';

@Pipe({
  name: 'localeDate'
})
export class LocaleDatePipe implements PipeTransform {

  constructor(
    private easyI18nService: EasyI18nService,
    @Inject(LOCALE_ID) private localeId: string
  ) {
  }

  transform(value: string | number | Date, format: string): string {
    return formatDate(value, format, this.easyI18nService.ngLocale ?? this.localeId);
  }
}
