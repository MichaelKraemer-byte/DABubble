import { Component, ViewChild } from '@angular/core';
import { MainHeaderComponent } from '../shared/header/main-header.component';
import { ChatComponent } from "./chat/chat.component";
import { ThreadComponent } from "./thread/thread.component";
import { DevspaceComponent } from "./devspace/devspace.component";
import { AuthenticationService } from '../../services/authentication/authentication.service';
import { CommonModule } from '@angular/common';
import { MainContentService } from '../../services/main-content/main-content.service';
import { MessagesService } from '../../services/messages/messages.service';


@Component({
  selector: 'app-main-content',
  standalone: true,
  imports: [
    MainHeaderComponent,
    ChatComponent,
    ThreadComponent,
    DevspaceComponent,
    CommonModule
],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss'
})
export class MainContentComponent {

  devSpaceAsTopLayer: boolean = false;
  chatAsTopLayer: boolean = false;
  threadAsTopLayer: boolean = false;
  threadIsOpen: boolean = false;
  private alreadyResized: boolean = false; 
  private isWidthAbove1285px: boolean = window.innerWidth > 1285;  
  @ViewChild('devSpace') devSpace!: DevspaceComponent; 


  constructor(
    private auth: AuthenticationService, 
    public messageService: MessagesService,
    public mainContentService: MainContentService,
  ) {
    auth.observerUser();
  }

  ngOnInit() {
    this.mainContentService.devSpaceAsTopLayerObs.subscribe(value => {
      this.devSpaceAsTopLayer = value;
    });
    this.mainContentService.chatAsTopLayerObs.subscribe(value => {
      this.chatAsTopLayer = value;
    });
    this.mainContentService.threadAsTopLayerObs.subscribe(value => {
      this.threadAsTopLayer = value;
    });
    this.mainContentService.threadIsOpen.subscribe(value => {
      this.threadIsOpen = value;
    });
    this.messageService.readChannel();
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  onWindowResize() {
    const currentWidth = window.innerWidth;

    if (currentWidth < 1285 && this.isWidthAbove1285px && !this.alreadyResized) {
      this.alreadyResized = true;
      window.location.reload();
    } else if (currentWidth >= 1285) {
      this.isWidthAbove1285px = true;
      this.alreadyResized = false;
    } else {
      this.isWidthAbove1285px = false;
    }
  }

  
}
