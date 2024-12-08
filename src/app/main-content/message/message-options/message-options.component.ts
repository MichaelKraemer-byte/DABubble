import { Component, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { EventService } from '../../../../services/event/event.service';
import { MessagesService } from '../../../../services/messages/messages.service';
import { MainContentService } from '../../../../services/main-content/main-content.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { DirectMessageService } from '../../../../services/directMessage/direct-message.service';
import { ThreadService } from '../../../../services/thread/thread.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';


@Component({
  selector: 'app-message-options',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    FormsModule,
    PickerComponent,
  ],
  templateUrl: './message-options.component.html',
  styleUrl: './message-options.component.scss'
})
export class MessageOptionsComponent {
  @Input() message: any;
  @Input() isMessageHover: any;
  @Input() isMessageEditMenuOpen: any;
  @Input() editMessageText: any;
  @Input() isThread: boolean = false;
  openEmojis: boolean = false;
  @Output() toggleEdit = new EventEmitter<void>();

  constructor(
    private renderer: Renderer2,
    public directMessage: DirectMessageService,
    public messageService: MessagesService,
    public threadService: ThreadService,
    private eventService: EventService,
    private mainContentService: MainContentService,
    public auth: AuthenticationService) { }


  toggleEditMode() {
    this.toggleEdit.emit();
    this.isMessageEditMenuOpen = false;
  }

  toggleEmojis(event: Event): void {
    event.stopPropagation();
    this.openEmojis = !this.openEmojis;
  }

  @HostListener('document:click', ['$event'])
  closeEmojisOnOutsideClick(event: Event): void {
    if (this.openEmojis && !(event.target as HTMLElement).closest('.emojis-container')) {
      this.openEmojis = false;
    }
  }

  addEmoji(event: any) {
    this.openEmojis = false;
    this.reactionMessage(event.emoji.native);
  }

  reactionMessage(reaction: string) {
    if (this.isThread) {
      this.threadService.reaction(reaction ,this.message.threadId)
    } else if (this.directMessage.isDirectMessage) {
      this.directMessage.reaction(reaction ,this.message.messageId)
    } else {
      this.messageService.reaction(reaction ,this.message.messageId)
    }
  }

  handleOnDelete() {
    if (this.isThread) {
      this.threadService.deleteMessageThread(this.message.threadId);
    } else if (this.directMessage.isDirectMessage) {
      this.directMessage.deleteMessage(this.message.messageId);
    } else {
      this.messageService.deleteMessage(this.message.messageId);
    }
  }

  openThread() {
    this.eventService.emitEvent('openThread');
    this.mainContentService.displayThread();
    this.checkWindowAndOpenThread();
    this.threadService.currentMessageId = this.message.messageId;
    this.threadService.readMessageThread(this.message.messageId)
    this.threadService.readThread(this.message.messageId);
  }

  checkWindowAndOpenThread() {
    if (window.innerWidth <= 1285) {
      this.mainContentService.openThreadForMobile();
    }
  }

  openEditMenu() {
    if (this.isMessageEditMenuOpen) {
      this.isMessageEditMenuOpen = false
    } else {
      this.isMessageEditMenuOpen = true
    }
  }
}
