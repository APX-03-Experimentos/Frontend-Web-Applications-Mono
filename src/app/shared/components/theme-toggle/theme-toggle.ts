import { Component } from '@angular/core';
import {ThemeService} from '../../services/theme.service';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';

@Component({
  selector: 'app-theme-toggle',
  imports: [
    MatIcon,
    MatIconButton
  ],
  templateUrl: './theme-toggle.html',
  standalone: true,
  styleUrl: './theme-toggle.css'
})
export class ThemeToggle {
  constructor(private themeService: ThemeService) {}

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
