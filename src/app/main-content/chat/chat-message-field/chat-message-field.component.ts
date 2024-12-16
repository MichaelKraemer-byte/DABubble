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
export class ChatMessageFieldComponent {
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
  @ViewChild('messageInput') messageInput!: ElementRef;

  currentChannelTitle: string | null = null;


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

  setFocus(): void {
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  ngOnInit() {
    this.auth.currentChannelData$.subscribe(data => {
      if (data) {
        this.currentChannelTitle = data.title;
      }
    });
    this.messageService.getFocusEvent().subscribe(() => {
      this.setFocus();
    });
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

  async handleSendMessage(): Promise<void> {
    if (this.messageService.isWriteAMessage) {
      await this.handleWriteAMessage();
    } else {
      await this.handleFallbackSendMessage();
    }
  }


  async handleWriteAMessage(): Promise<void> {
    const members = await firstValueFrom(this.memberService.getAllMembersFromFirestoreObservable());
    const currentMember = await this.auth.getCurrentMemberSafe();

    if (!currentMember) {
      return;
    }

    const channels = await firstValueFrom(this.channelService.getAllAccessableChannelsFromFirestoreObservable(currentMember));

    for (const selectedObject of this.messageService.selectedObjects) {
      await this.processSelectedObject(selectedObject, members, channels, currentMember);
    }

    this.resetMessageField();
    this.auth.enableInfoBanner('Message(s) have been sent.');
  }


  async processSelectedObject(
    selectedObject: any,
    members: Member[],
    channels: Channel[],
    currentMember: Member
  ): Promise<void> {
    if (selectedObject.type === 'email' || selectedObject.type === 'member') {
      await this.handleSelectedMember(selectedObject, members);
    } else if (selectedObject.type === 'channel') {
      await this.handleSelectedChannel(selectedObject, channels, currentMember);
    }
  }


  async handleSelectedMember(selectedObject: any, members: Member[]): Promise<void> {
    const member = selectedObject.value as Member;
    if (members.some(m => m.id === member.id)) {
      await this.handleSendDirectMessageForChatHeader(member.id, this.messageField);
    }
  }


  async handleSelectedChannel(
    selectedObject: any,
    channels: Channel[],
    currentMember: Member
  ): Promise<void> {
    const channel = selectedObject.value as Channel;
    if (channels.some(c => c.id === channel.id)) {
      await this.messageService.sendMessageToChannel(channel.id, this.messageField, currentMember);
    }
  }


  async handleFallbackSendMessage(): Promise<void> {
    if (this.messageField.trim() || this.storageService.messageImages.length > 0) {
      this.messageSent.emit();
      if (this.directMessageService.isDirectMessage) {
        await this.sendDirectMessage();
      } else {
        await this.sendMessage();
      }
    }
  }


  resetMessageField(): void {
    this.messageField = '';
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

  async onInput(event: any) {
    const lastAtSignIndex = this.messageField.lastIndexOf('@');
    const lastAtHashIndex = this.messageField.lastIndexOf('#');
  
    if (this.messageField.trim() === '') {
      this.showUserList = false;
      return;
    }
  
    // Behandlung für @ und #
    if (lastAtSignIndex > lastAtHashIndex && lastAtSignIndex > -1) {
      this.handleUserMention(lastAtSignIndex);
    } else if (lastAtHashIndex > lastAtSignIndex && lastAtHashIndex > -1) {
      await this.handleChannelMention(lastAtHashIndex);
    } else {
      this.showUserList = false;
    }
  }
  
  private handleUserMention(lastAtSignIndex: number) {
    const searchQuery = this.messageField.substring(lastAtSignIndex + 1).trim();
    if (!searchQuery.includes(' ')) {
      this.users = this.memberService.allMembersNames; 
      this.filteredUsers = this.users.filter(user =>
        user.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
      this.showUserList = true;
      this.selectedIndex = 0;
    } else {
      this.showUserList = false;
    }
  }
  
  private async handleChannelMention(lastAtHashIndex: number) {
    const searchQuery = this.messageField.substring(lastAtHashIndex + 1).trim();
    if (searchQuery.includes(' ')) {
      this.showUserList = false;
      return;
    }
    this.showUserList = true;
    let allChannels = await this.messageService.hashChannels(); 
    this.filteredUsers = allChannels;
  }

  allUsers() {
    this.memberService.allMembersName();
  }

  selectUser(user: any) {
    const lastAtSignIndex = this.messageField.lastIndexOf('@');
    const lastAtHashIndex = this.messageField.lastIndexOf('#');
    if (lastAtSignIndex > lastAtHashIndex) {
      this.messageField = this.messageField.substring(0, lastAtSignIndex + 1) + user + ' ';
    } else if (lastAtHashIndex > -1) {
      this.messageField = this.messageField.substring(0, lastAtHashIndex + 1) + user + ' ';
    }

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
    } else if (event.key === ' ') {
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
    if (this.showUserList && this.selectedIndex >= 0 && event.key === 'Enter') {
      event.preventDefault();
      this.selectUser(this.filteredUsers[this.selectedIndex]);
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSendMessage();
    }
  }

  getPlaceholder(): string {
    return this.messageService.isWriteAMessage
      ? ''
      : `Message to #${this.currentChannelTitle || this.auth.currentChannelData?.title}`;
  }
  
}

