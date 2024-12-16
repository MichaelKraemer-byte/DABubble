import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { ThreadImagesPreviewComponent } from "./thread-images-preview/thread-images-preview.component";
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { ThreadService } from '../../../../services/thread/thread.service';
import { MemberService } from '../../../../services/member/member.service';
import { StorageService } from '../../../../services/storage/storage.service';
import { MessagesService } from '../../../../services/messages/messages.service';

@Component({
  selector: 'app-thread-message-field',
  standalone: true,
  imports: [
    MatIcon,
    PickerComponent,
    CommonModule,
    MatMenuModule,
    FormsModule,
    ThreadImagesPreviewComponent
],
  templateUrl: './thread-message-field.component.html',
  styleUrl: './thread-message-field.component.scss'
})
export class ThreadMessageFieldComponent  implements OnInit{
  openEmojis: boolean = false;
  messageField: string = '';
  openData: boolean = false;
  imageUploadsThread: File[] = [];
  imagePreviewsThread: (string | ArrayBuffer | null)[] = [];

  users: string[] = [];
  showUserList: boolean = false;
  filteredUsers: string[] = [];
  selectedIndex = -1;
  @ViewChild('userListContainer') userListContainer!: ElementRef;

  @Output() messageSent = new EventEmitter<void>();
  @Output() messagesUpdated = new EventEmitter<void>();

  currentChannelTitle: string | null = null;


  constructor(
    public auth: AuthenticationService,
    private memberService: MemberService,
    public threadService: ThreadService,
    public storageService: StorageService,
    public messageService: MessagesService
  ) {
    this.allUsers()
  }

  allUsers() {
    this.memberService.allMembersName();
  }
 
  ngOnInit(): void {
    this.memberService.setCurrentMemberData();
    this.auth.currentChannelData$.subscribe(data => {
      if (data) {
        this.currentChannelTitle = data.title;
      }
    });
  }

  async sendMessage() {
    if (this.messageField.trim() || this.storageService.messageImagesThread.length > 0) {
    await this.threadService.createThread(this.messageField);
    this.messagesUpdated.emit();
    this.messageField = '';
    this.imageUploadsThread = [];
    this.imagePreviewsThread = [];
    this.messageSent.emit()
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
        this.storageService.uploadImageMessageThread(file)
        
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewsThread.push(reader.result);
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

  selectUser(user: string) {
    const lastAtSignIndex = this.messageField.lastIndexOf('@');
    const lastAtHashIndex = this.messageField.lastIndexOf('#');
  
    if (lastAtSignIndex > lastAtHashIndex) {
      this.messageField = this.messageField.substring(0, lastAtSignIndex + 1) + user + ' ';
    } else if (lastAtHashIndex > -1) {
      this.messageField = this.messageField.substring(0, lastAtHashIndex) + '#' + user + ' ';
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
      this.sendMessage();
    }
  }

  getPlaceholder(): string {
    return this.messageService.isWriteAMessage
      ? ''
      : `Message to #${this.currentChannelTitle || this.auth.currentChannelData?.title}`;
  }

}

