import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme: Theme = 'light';
  private readonly THEME_KEY = 'app-theme';

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.loadInitialTheme();
  }

  private loadInitialTheme(): void {
    if (isPlatformBrowser(this.platformId)) {
      // 1. Verificar si hay un tema guardado en localStorage
      const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;

      // 2. Si no hay tema guardado, verificar las preferencias del sistema
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
      }
    }
  }

  setTheme(theme: Theme): void {
    this.currentTheme = theme;

    if (isPlatformBrowser(this.platformId)) {
      // Actualizar el atributo data-theme en el html
      document.documentElement.setAttribute('data-theme', theme);

      // Actualizar color-scheme en el body
      document.body.style.colorScheme = theme;

      // Guardar en localStorage
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  toggleTheme(): void {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  isDarkTheme(): boolean {
    return this.currentTheme === 'dark';
  }
}
