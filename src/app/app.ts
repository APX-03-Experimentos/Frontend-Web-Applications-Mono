import {Component, OnInit, signal} from '@angular/core';
import {Navigator} from './public/components/navigator/navigator';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [Navigator],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true
})
export class App implements OnInit{
  protected readonly title = signal('LhFrontEnd');

  constructor(
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }
}
