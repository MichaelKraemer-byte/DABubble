import { Component, HostListener, Renderer2, ElementRef, Output, EventEmitter } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatButtonModule} from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { SearchbarComponent } from "./searchbar/searchbar.component";
import { ProfileNavigationComponent } from "./profile-navigation/profile-navigation.component";
import { DarkModeService } from '../../../services/darkMode/dark-mode.service';
import { MainContentService } from '../../../services/main-content/main-content.service';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatMenuModule, CommonModule, SearchbarComponent, ProfileNavigationComponent],
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss', 'main-header-material-design.scss']
})
export class MainHeaderComponent {
  windowWidth: number = window.innerWidth; 
  placeholder: string = 'Search in Devspace';

  @Output() backToDevSpaceEvent = new EventEmitter();

  constructor(
    private renderer: Renderer2, 
    private elRef: ElementRef, 
    public darkmode : DarkModeService,
    public mainContentService: MainContentService){
    this.updatePlaceholder();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.windowWidth = window.innerWidth;
    this.updatePlaceholder();
  }

  updatePlaceholder() {
    if (this.windowWidth <= 600 && this.windowWidth >= 450) {
      this.placeholder = 'Search'; 
    } else {
      this.placeholder = 'Search in Devspace'; 
    }
  }

  backToDevSpace(){
    this.backToDevSpaceEvent.emit();
  }
}
