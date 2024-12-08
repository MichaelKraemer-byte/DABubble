import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { ImagesPreviewComponent } from "./images-preview/images-preview.component";
import { MessagesService } from '../../../../services/messages/messages.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { Member, Message, Thread } from '../../../../interface/message';
import { StorageService } from '../../../../services/storage/storage.service';
import { MemberService } from '../../../../services/member/member.service';
import { DirectMessageService } from '../../../../services/directMessage/direct-message.service';
import { ChatHeaderComponent } from '../chat-header/chat-header.component';
import { firstValueFrom } from 'rxjs';
import { Channel } from '../../../../classes/channel.class';
import { ChannelService } from '../../../../services/channel/channel.service';
import { MainContentService } from '../../../../services/main-content/main-content.service';


@Component({
  selector: 'app-chat-message-field',
  standalone: true,
  imports: [
    MatIcon,
    PickerComponent,
    CommonModule,
    MatMenuModule,
    FormsModule,
    ImagesPreviewComponent,
  ],
  templateUrl: './chat-message-field.component.html',
  styleUrl: './chat-message-field.component.scss'
})
export class ChatMessageFieldComponent{
  openEmojis: boolean = false;
  messageField: string = ''
  openData: boolean = false;
  imageUploads: File[] = [];
  imagePreviews: (string | ArrayBuffer | null)[] = [];
  public isDirectMessage: boolean = true;

  users: string[] = [];
  showUserList: boolean = false;
  filteredUsers: string[] = [];
  selectedIndex = -1;
  @ViewChild('userListContainer') userListContainer!: ElementRef;
  @Output() messageSent = new EventEmitter<void>();

  constructor(
    public auth: AuthenticationService,
    public memberService: MemberService,
    public channelService: ChannelService,
    public messageService: MessagesService,
    public storageService: StorageService,
    public directMessageService: DirectMessageService,
    public mainContentService: MainContentService
  ) {
    this.allUsers()
  }

  async sendMessage() {
    await this.memberService.setCurrentMemberData();
    this.messageService.createMessage(this.messageField);
    this.messageField = '';
    this.imageUploads = [];
    this.imagePreviews = [];
  }

  async sendDirectMessage() {
    await this.directMessageService.createDirectMessage(this.messageField);
    this.messageField = '';
    this.imageUploads = [];
    this.imagePreviews = [];
  }

  async handleSendMessage() {
    if (this.messageService.isWriteAMessage) {
      const members = await firstValueFrom(this.memberService.getAllMembersFromFirestoreObservable());
      const currentMember = await this.auth.getCurrentMemberSafe();
      if (!currentMember) {
        console.log('No current member in handleSendMessage');
        return;
      }
      const channels = await firstValueFrom(this.channelService.getAllAccessableChannelsFromFirestoreObservable(currentMember));
  
      // Über alle ausgewählten Objekte iterieren
      for (const selectedObject of this.messageService.selectedObjects) {
        if (selectedObject.type === 'email' || selectedObject.type === 'member') {
          const member = selectedObject.value as Member;
          if (members.some(m => m.id === member.id)) {
            await this.handleSendDirectMessageForChatHeader(member.id, this.messageField);
          }
        } else if (selectedObject.type === 'channel') {
          const channel = selectedObject.value as Channel;
          if (channels.some(c => c.id === channel.id)) {
            await this.messageService.sendMessageToChannel(channel.id, this.messageField, currentMember);
          }
        }
      }
      this.messageField = '';  // Eingabefeld zurücksetzen
      this.auth.enableInfoBanner('Message(s) have been sent.');
    } else {
      // Fallback: Falls keine Objekte ausgewählt wurden, reguläre Nachrichtenlogik ausführen
      if (this.messageField.trim() || this.storageService.messageImages.length > 0) {
        this.messageSent.emit();
        if (this.directMessageService.isDirectMessage) {
          await this.sendDirectMessage();
        } else {
          await this.sendMessage();
        }
      }
    }
  }
  
  

  async handleSendDirectMessageForChatHeader(targetMemberId: string, message: string) {
    try {
      await this.directMessageService.checkOrCreateDirectMessageChannel(targetMemberId);
      await this.directMessageService.createDirectMessage(message);
      this.auth.enableInfoBanner('Message has been sent.');
    } catch (error) {
      console.error('Error while sending the direct message', error);
    }
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files) {
      Array.from(input.files).forEach(file => {
        this.storageService.uploadImageMessage(file)
        
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  addEmoji(event: any) {
    this.messageField += event.emoji.native;
    this.openEmojis = false;
  }

  onInput(event: any) {
    const lastAtSignIndex = this.messageField.lastIndexOf('@');
    if (lastAtSignIndex > -1) {
      const searchQuery = this.messageField.substring(lastAtSignIndex + 1).trim();
      if (searchQuery && !searchQuery.includes(' ')) {
        this.filteredUsers = this.users.filter(user =>
          user.toLowerCase().startsWith(searchQuery.toLowerCase())
        );
        this.showUserList = this.filteredUsers.length > 0;
        this.selectedIndex = 0;
      } else {
        this.showUserList = false;
      }
    } else {
      this.showUserList = false;
    }
  }

  allUsers() {
    this.memberService.allMembersName();
  }

  selectUser(user: any) {
    const lastAtSignIndex = this.messageField.lastIndexOf('@');
    this.messageField = this.messageField.substring(0, lastAtSignIndex + 1) + user + ' ';
    this.showUserList = false;
    this.selectedIndex = -1;
  }

  addTag() {
    this.users = this.memberService.allMembersNames
    this.messageField += '@';
    this.showUserList = true;
    this.filteredUsers = this.users;
  }


  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.showUserList) return;

    if (event.key === 'ArrowDown') {
      this.selectedIndex = (this.selectedIndex + 1) % this.filteredUsers.length;
      this.scrollToSelected();
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      this.selectedIndex = (this.selectedIndex - 1 + this.filteredUsers.length) % this.filteredUsers.length;
      this.scrollToSelected();
      event.preventDefault();
    } else if (event.key === 'Enter' && this.selectedIndex >= 0) {
      this.selectUser(this.filteredUsers[this.selectedIndex]);
      event.preventDefault();
    } else if (event.key === ' ') {  // Leerzeichen schließt die Liste
      this.showUserList = false;
    }
  }

  private scrollToSelected() {
    setTimeout(() => {
      const items = this.userListContainer.nativeElement.querySelectorAll('li');
      if (items[this.selectedIndex]) {
        items[this.selectedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 0);
  }

  checkEnterKey(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    this.handleSendMessage();
  }
}

getPlaceholder(): string {
  return this.messageService.isWriteAMessage 
    ? '' 
    : `Message to #${this.auth.currentChannelData?.title || ''}`;
}
}

