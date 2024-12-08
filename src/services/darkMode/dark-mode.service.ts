import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  public darkMode = false;

  constructor() {
    this.loadDarkModeFromStorage();
    this.applyDarkMode();
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    this.saveDarkModeToStorage();
    this.applyDarkMode();
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }

  private applyDarkMode(): void {
    if (this.darkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  private saveDarkModeToStorage(): void {
    localStorage.setItem('darkMode', JSON.stringify(this.darkMode));
  }

  private loadDarkModeFromStorage(): void {
    const storedValue = localStorage.getItem('darkMode');
    this.darkMode = storedValue ? JSON.parse(storedValue) : false;
  }
}
