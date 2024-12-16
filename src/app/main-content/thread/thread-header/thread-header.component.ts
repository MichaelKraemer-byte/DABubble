import { Component, EventEmitter, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MainContentService } from '../../../../services/main-content/main-content.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thread-header',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule
  ],
  templateUrl: './thread-header.component.html',
  styleUrl: './thread-header.component.scss'
})
export class ThreadHeaderComponent {
  @Output() closeThreadEvent = new EventEmitter();

  constructor(private mainContentService: MainContentService, public auth: AuthenticationService) {}

  closeThread() {
    this.closeThreadEvent.emit();
    this.mainContentService.hideThread();
    this.mainContentService.makeChatAsTopLayer();
  }
}
