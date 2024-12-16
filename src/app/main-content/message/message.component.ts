import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MessageOptionsComponent } from './message-options/message-options.component';
import { MessageReationComponent } from './message-reation/message-reation.component';
import { MessageAnswerComponent } from './message-answer/message-answer.component';
import { MessageImagesComponent } from './message-images/message-images.component';
import { MessageTextComponent } from './message-text/message-text.component';
import { MessageNameComponent } from './message-name/message-name.component';
import { MessagesService } from '../../../services/messages/messages.service';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { DirectMessageService } from '../../../services/directMessage/direct-message.service';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [
    CommonModule,
    MessageOptionsComponent,
    MessageReationComponent,
    MessageAnswerComponent,
    MessageImagesComponent,
    MessageTextComponent,
    MessageNameComponent
  ],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {
  @Input() message: any;
  @Input() index: any;
  @Input() thread: boolean = false;
  @Input() threadFirstMessage: boolean = false;

  isMessageHover: boolean = false;
  isMessageEditMenuOpen = false;
  isEdit: boolean = false;
  editMessageText: string = '';

  currentMember$;

  constructor(
    public messageService: MessagesService,
    public directMessageService: DirectMessageService,
    public auth: AuthenticationService) { 
      this.currentMember$ = auth.currentMember$
    }

  showMenu(){
    this.isMessageHover = true;
  }

  resetHoverAndMenu() {
    this.isMessageHover = false;
    this.isMessageEditMenuOpen = false;
  }

  toggleEditMode() {
    if (this.isEdit) {
      this.isEdit = false;
    } else {
      this.isEdit = true;
      this.editMessageText = this.message.message;
    }
  }

  saveText() {
    this.isEdit = false
  }

  cancelEdit() {
    this.isEdit = false
  }

  parseDate(time: string) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
    const weekday = formatter.format(now);
    const day = now.getDate(); 
    const month = now.toLocaleString('en-US', { month: 'long' });
    const createdAt = `${weekday}, ${day} ${month}`;

    if (time == createdAt) {
      return 'Today'
    }
    return time
  }

}
