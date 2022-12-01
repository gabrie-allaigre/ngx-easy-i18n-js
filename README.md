# ngx-easy-i18n-js

**Pure version angular for internalization (i18n).**

Translations are static. If you change language you must refresh the page or use bootstrap extension.

> Use EasyI18 Js library https://github.com/gabrie-allaigre/easy-i18n-js

## Download and Installation

Install using npm:

```shell
npm install easy-i18n-js @ngx-easy-i18n-js/core --save
```

Open angular.json and under allowedCommonJsDependencies add:

```json
"allowedCommonJsDependencies": [
"easy-i18n-js"
]
```

Usage in app.module.ts, add `imports`

```typescript
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';

imports: [
  EasyI18nModule.forRoot({
    options: {
      logging: false
    },
    ngLocales: {
      'fr': localeFr,
      'en': localeEn,
    },
    defaultLanguage: 'en-US'
  })
]
```

#### Configuration

```typescript
export interface EasyI18nModuleConfig {
  // Options fo easy i18 js library
  options?: EasyI18nOptions;
  // Use specific loader
  loader?: Provider;
  // Add Angular locale <code>import localeFr from '@angular/common/locales/fr';</code>
  ngLocales?: { [key: string]: any; };
  // Use browser language
  useBrowserLanguage?: boolean;
  // Default fallback language use if current language not found
  defaultLanguage?: string;
  // Use exact language (default false) if false, fr-FR and fr
  onlyExactLanguage?: boolean;
}
```

In child module

```typescript
imports: [
  EasyI18nModule
]
```

For change current locale use `EasyI18nService`

```typescript
export class MyComponent {

  constructor(
    private easyI18nService: EasyI18nService
  ) {
  }

  public doChangeLanguage(locale: string): void {
    this.easyI18nService.registerCulture('fr');
  }
}
```

### Locale pipes

In HTML, uses locales pipes to get dates, numbers in locale format

| pipe             | description                                    | example                                                                                           |
|------------------|------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `localeDate`     | Same as `date`                                 | <code>{{ mydate &#124; localeDate:'short' }}</code>                                               |
| `localeNumber`   | Same as `number`                               | <code>{{ mydate &#124; localeNumber }}</code>                                                     |
| `localeCurrency` | Same as `currency`                             | <code>{{ mydate &#124; localeCurrency }}</code>                                                   |
| `localePercent`  | Same as `percent`                              | <code>{{ mydate &#124; localePercent }}</code>                                                    |

### Translate

Main function for translate your language keys

#### HTML file

In HTML template, with pipe, parameter is TrOptions

```angular2html
{{ 'hello' | tr }}
{{ 'hello_with_genre' | tr: {gender: 'male'} }}
{{ 'My name is {}' | tr: {args: ['Gabriel']} }}
```

**TrOptions arguments**

| Name      | type                                               | example                            |
|-----------|----------------------------------------------------|------------------------------------|
| args      | `string[]`                                         | `['Gabriel', '20']`                |
| namedArgs | `{ [key: string]: string; } }`                     | `{ name : 'Gabriel', age : '20' }` |
| namespace | `string`                                           | `'common'`                         |
| gender    | <code>'male' &#124; 'female' &#124; 'other'</code> | `gender: 'other'`                  |

**Directives**

There are 2 differents directives

First is simple, translate `[tr]`

| Directive            | description                  | example                                                                            |
|----------------------|------------------------------|------------------------------------------------------------------------------------|
| `tr`                 | Active directive translate   | <code>&lt;span tr&gt;hello&lt;/span&gt;</code>                                     |
| `trNamespace`        | Add namespace                | <code>&lt;span tr trNamespace="common"&gt;hello&lt;/span&gt;</code>                |
| `trGender`           | Gender                       | <code>&lt;span tr trGender="male"&gt;hello_with_genre&lt;/span&gt;</code>          |
| `trArgs`             | Arguments                    | <code>&lt;span tr [trArgs]="['Gabriel']"&gt;hello&lt;/span&gt;</code>              |
| `trNamedArgs`        | Named arguments              | <code>&lt;span tr [trNamedArgs]="{ name: 'Gabriel' }"&gt;hello&lt;/span&gt;</code> |

Second, use HTML named arguments `[trContent]`, replace `{namedArg}` with child element `*trElement`

| Directive     | description                                    | 
|---------------|------------------------------------------------|
| `trContent`   | Active content directive translate, get a key  |
| `trNamespace` | Add namespace                                  |
| `trGender`    | Gender                                         |
| `trArgs`      | Arguments                                      |
| `trNamedArgs` | Named arguments                                |
| `demarc`      | Change token start, end identifier             |

**Examples**

```angular2html
<!-- "hello_name": "My name is {name}" -->
<div trContent="hello_name">
    <span *trElement="'name'" style="color: red; font-size: 2rem; font-weight: bold">Gabriel</span>
</div>
```

```angular2html
<div trContent="My name is {name} and I live in {country}" style="color: blue;">
    <span *trElement="'name'" style="color: red; font-size: 2rem; font-weight: bold">Gabriel</span>
    <span *trElement="'country'">{{ var_country }}</span>
</div>
```

#### Typescript file

You can use extension methods of [String], you can also use tr() as a static function.

In typescript file, **there is no need to inject EasyI18nService**

```typescript
'hello'.tr();
'hello_with_genre'.tr({ gender: 'male' });
tr('hello');
tr('hello_with_genre', { gender: 'male' });
```

### Translate Plural

You can translate with pluralization. To insert a number in the translated string, use {}.

#### HTML file

In HTML template, with pipe, first parameter is number and second PluralOptions

```angular2html
{{ 'money' | plural:10 }}
{{ 'money_with_args' | plural:3: {args: ['Gabriel']} }}
```

**PluralOptions arguments**

| Name              | type                                               | example                            |
|-------------------|----------------------------------------------------|------------------------------------|
| args              | `string[]`                                         | `['Gabriel', '20']`                |
| namedArgs         | `{ [key: string]: string; } }`                     | `{ name : 'Gabriel', age : '20' }` |
| namespace         | `string`                                           | `'common'`                         |
| name              | `string`                                           | `money`                            |
| numberFormatterFn | `(value: number) => string`                        | `(value) => value.Precision(3)`    |
| gender            | <code>'male' &#124; 'female' &#124; 'other'</code> | `gender: 'other'`                  |

**Directives**

There are 2 different directives

First is simple, translate plural `[plural]`

| Directive                  | description                | example                                                                                           |
|----------------------------|----------------------------|---------------------------------------------------------------------------------------------------|
| `plural`                   | Active directive translate | <code>&lt;span [plural]="10"&gt;money&lt;/span&gt;</code>                                         |
| `pluralNamespace`          | Add namespace              | <code>&lt;span [plural]="100" pluralNamespace="common"&gt;money&lt;/span&gt;</code>               |
| `pluralGender`             | Gender                     | <code>&lt;span [plural]="1" pluralGender="male"&gt;money_with_genre&lt;/span&gt;</code>           |
| `pluralArgs`               | Arguments                  | <code>&lt;span [plural]="5" [pluralArgs]="['Gabriel']"&gt;money&lt;/span&gt;</code>               |
| `pluralNamedArgs`          | Named arguments            | <code>&lt;span [plural]="13" [pluralNamedArgs]="{ name: 'Gabriel' }"&gt;money&lt;/span&gt;</code> |
| `pluralName`               | Name value                 | <code>&lt;span [plural]="4" pluralName="value"&gt;money&lt;/span&gt;</code>                       |
| `pluralNumberFormatterFn`  | Formatter function         | <code>&lt;span [plural]="10000" [pluralNumberFormatterFn]="myFn"&gt;money&lt;/span&gt;</code>     |

Second, use HTML named arguments `[pluralContent]`, replace `{namedArg}` with child element `*pluralElement`

| Directive                 | description                                     | 
|---------------------------|-------------------------------------------------|
| `pluralContent`           | Active content directive translate, get a key   |
| `pluralValue`             | Active content directive translate, get a value |
| `pluralNamespace`         | Add namespace                                   |
| `pluralGender`            | Gender                                          |
| `pluralArgs`              | Arguments                                       |
| `pluralNamedArgs`         | Named arguments                                 |
| `pluralName`              | Name value                                      |
| `pluralNumberFormatterFn` | Formatter function                              |
| `demarc`                  | Change token start, end identifier              |

**Examples**

```angular2html
<!-- "money_content": { 
    "zero": "{name} not have money",
    "one": "{name} have {money} dollar",
    "two": "{name} have {money} dollars",
    "many": "{name} have {money} dollars",
    "other": "{name} have {money} dollars"
} -->
<div pluralContent="money_content" [pluralValue]="var_money" class="fst-italic text-gray-500">
    <span *pluralElement="'name'" style="color: red; font-size: 2rem; font-weight: bold">Gabriel</span>
    <span *pluralElement="'money'" style="color: blueviolet; font-weight: bold" [style.font-size]="(var_money / 10) + 'vw'">{{ var_money }}</span>
</div>
```

#### Typescript file

You can use extension methods of [String], you can also use plural() as a static function.

In typescript file, **there is no need to inject EasyI18nService**

```typescript
'money_args'.plural(0, { args: ['Gabriel'] });
'money_args'.plural(1.5, { args: ['Gabriel'] });
plural('money_args', { args: ['Gabriel'] });
```

## Add HttpLoader

Load messages with `HttpClient`

Install using npm:

```shell
npm install @ngx-easy-i18n-js/http-loader --save
```

Usage in app.module.ts, add provider

```typescript
providers: [
  {
    provide: EasyI18nLoader,
    deps: [HttpClient],
    useFactory: (httpClient: HttpClient) => new HttpEasyI18nLoader(httpClient)
  }
]
```

Change prefix or suffix with options

```typescript
new HttpEasyI18nLoader(httpClient, {
  prefix: 'assets/',
  suffix: '.json5'
});
```

## Add Bootstrap (not deployed)

Bootstrap application, refresh application when locale change

Install using npm:

```shell
npm install @angular/cdk @ngx-easy-i18n-js/bootstrap --save
```

Usage

```typescript
imports: [
  EasyI18nBootstrapModule.forRoot({
    bootstrap: AppComponent
  })
]

bootstrap: [EasyI18nBootstrapComponent]
```