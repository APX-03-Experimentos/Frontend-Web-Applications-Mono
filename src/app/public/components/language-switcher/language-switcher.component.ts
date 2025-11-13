import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';

@Component({
  selector: 'app-language-switcher',
  imports: [
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: 'language-switcher.component.html',
  standalone: true,
  styleUrl: 'language-switcher.component.css'
})
export class LanguageSwitcherComponent {

  protected currentLanguage: string = 'en';
  protected languages: string[] = ['en', 'es'];

  constructor(private translate: TranslateService) {
    this.currentLanguage = this.translate.currentLang;
  }

  useLanguage(language: string): void {
    this.translate.use(language);
    this.currentLanguage = language;
    localStorage.setItem('pref_lang', language);
  }

}
