import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { HostListener } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DarkModeService } from '../../../../services/darkMode/dark-mode.service';
import { ProfileComponent } from '../../../dialog/profile/profile.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-navigation',
  standalone: true,
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIcon,
    RouterModule,
    CommonModule
  ],
  templateUrl: './profile-navigation.component.html',
  styleUrl: './profile-navigation.component.scss'
})
export class ProfileNavigationComponent {
  readonly dialog = inject(MatDialog);

  toInnerHTML = '';
  sizeThreshold = 1285;
  currentImgPath = './img/profile-pic/006.svg'
  switchMobilOn = false

  currentMember$;

  constructor(
    public darkMode: DarkModeService, 
    public auth: AuthenticationService,
  ) { 
    this.currentMember$ = this.auth.currentMember$;
  }


  openDialog(): void {
    if (window.innerWidth <= 450) {
      const dialogRef = this.dialog.open(ProfileComponent, {
        width: '300px',
        height: 'auto',
        position: { top: '324px', right: '8px' },
        autoFocus: false,
        panelClass: 'custom-dialog'
      });
      dialogRef.afterClosed().subscribe();     
    } else {
      const dialogRef = this.dialog.open(ProfileComponent, {
        width: '360px',
        height: 'auto',
        position: { top: '482px', right: '64px' },
        autoFocus: false,
        panelClass: 'custom-dialog'
      });
      dialogRef.afterClosed().subscribe();      
    }
  }

  ngOnInit() {
    let windowWidth = window.innerWidth;
    this.switchMobilOn = windowWidth < this.sizeThreshold ? false : true;
  }

  toggleTheme() {
    this.darkMode.toggleDarkMode();
  }

  isDarkMode(): boolean {
    return this.darkMode.isDarkMode();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    let windowWidth = window.innerWidth;
    this.toInnerHTML = windowWidth < this.sizeThreshold ? `<mat-icon> keyboard_arrow_down </mat-icon>` : `<img src="${this.currentImgPath}">`;
    this.switchMobilOn = windowWidth < this.sizeThreshold ? false : true;
  }

  signOutUser() {
    this.auth.signOutUser()
  }
}
