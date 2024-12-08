import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MessagesService } from '../../../../services/messages/messages.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { StorageService } from '../../../../services/storage/storage.service';
import { ThreadService } from '../../../../services/thread/thread.service';
import { DirectMessageService } from '../../../../services/directMessage/direct-message.service';

@Component({
  selector: 'app-message-images',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon
  ],
  templateUrl: './message-images.component.html',
  styleUrl: './message-images.component.scss'
})
export class MessageImagesComponent {
  @Input() message: any;
  @Input() isEdit: any
  @Input() isThread: boolean = false;

  constructor(
    public messageService: MessagesService,
    public auth: AuthenticationService,
    private storageService: StorageService,
    private threadService: ThreadService,
    private directMessage: DirectMessageService,

  ) { }

  deleteImage(attachment: any, messageId: any) {
    if (this.isThread) {
      this.threadService.deleteImages(attachment, messageId.threadId);
    } else if (this.directMessage.isDirectMessage) {
      this.directMessage.deleteImages(attachment, messageId.messageId);
    } else {
      this.messageService.deleteImages(attachment, messageId.messageId)
    }
    this.storageService.deleteMessageImages(attachment);
  }
}
