import { Component, ElementRef, ViewChild } from '@angular/core';
import { ChatHeaderComponent } from "./chat-header/chat-header.component";
import { ChatMessageFieldComponent } from "./chat-message-field/chat-message-field.component";
import { CommonModule } from '@angular/common';
import { Message } from '../../../interface/message';
import { MessageComponent } from "../message/message.component";
import { MessagesService } from '../../../services/messages/messages.service';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { MatIcon } from '@angular/material/icon';
import { DirectMessageService } from '../../../services/directMessage/direct-message.service';
import { InfoBannerComponent } from "../../shared/info-banner/info-banner.component";



@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    ChatHeaderComponent,
    ChatMessageFieldComponent,
    CommonModule,
    MessageComponent,
    MatIcon,
    InfoBannerComponent
],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  public message: Message[] = [];
  public currentUserId: string = 'uidTestId';
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  private shouldScroll: boolean = true;
  public isLoading: boolean = true;
  private userScrolledUp = false;

  constructor(
    public object: MessagesService, 
    public auth: AuthenticationService,
    public directMessageService: DirectMessageService,
    public messageService: MessagesService
  ) {
  }

  ngOnInit() {
    this.messageService.messagesUpdated.subscribe(() => {
      this.message = [...this.messageService.messages];
      this.isLoading = false;
      this.shouldScroll = true;
    });
    this.directMessageService.messagesUpdated.subscribe(() => {
      this.isLoading = false;
      this.shouldScroll = true;
    });
  }

  onMessagesUpdated() {
    this.message = [...this.messageService.messages];
    const container = this.messageContainer.nativeElement;
    const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
    if (isAtBottom) {
      this.shouldScroll = true; 
    } else {
      this.shouldScroll = false; 
      this.userScrolledUp = true; 
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && !this.userScrolledUp) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  scrollToBottom(): void {
    try {
      const container = this.messageContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  onScroll(): void {
    const container = this.messageContainer.nativeElement;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 10; 
    if (isAtBottom) {
      this.userScrolledUp = false; 
    } else {
      this.userScrolledUp = true;
    }
  }

  isUserDirectMessage() {
    return this.directMessageService.userOne == this.directMessageService.userTwo
  }

  checkUserAdmin(admin: string) {
    return this.auth.memberId == admin
  }

   isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }
  
   formatTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Intl.DateTimeFormat("de-DE", options).format(date);
  }
  
   formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const formatter = new Intl.DateTimeFormat("de-DE", options).format(date);
    const [datePart, timePart] = formatter.split(", ");
    return `am ${datePart} um ${timePart}`;
  }
  
   parseTime(time: { toDate: () => Date }): string {
    const date = time.toDate();
    return this.isToday(date) ? `Today` : this.formatDate(date);
  }

}
