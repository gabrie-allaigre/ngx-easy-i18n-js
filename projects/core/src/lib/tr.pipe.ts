import { Pipe, PipeTransform } from '@angular/core';
import { tr, TrOptions } from 'easy-i18n-js';

@Pipe({
  name: 'tr'
})
export class TrPipe implements PipeTransform {

  transform(text: string, options?: TrOptions): string {
    if (!text) {
      return text;
    }
    return tr(text, options);
  }

}
