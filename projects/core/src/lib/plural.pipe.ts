import { Pipe, PipeTransform } from '@angular/core';
import { plural, PluralOptions } from 'easy-i18n-js';

@Pipe({
  name: 'plural',
  standalone: true
})
export class PluralPipe implements PipeTransform {

  transform(text: string, value: number, options?: PluralOptions): string {
    if (!text) {
      return text;
    }
    return plural(text, value, options);
  }

}
