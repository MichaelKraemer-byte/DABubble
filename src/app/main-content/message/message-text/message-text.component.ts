import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagesService } from '../../../../services/messages/messages.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { ThreadService } from '../../../../services/thread/thread.service';
import { DirectMessageService } from '../../../../services/directMessage/direct-message.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MemberService } from '../../../../services/member/member.service';

@Component({
  selector: 'app-message-text',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './message-text.component.html',
  styleUrl: './message-text.component.scss'
})
export class MessageTextComponent {
  @Input() message: any;
  @Input() isEdit: any;
  @Input() editMessageText: any;
  @Input() isThread: boolean = false;
  @Input() isMessageHover: any;

  @Output() saveText = new EventEmitter<void>();
  @Output() cancelEdit = new EventEmitter<void>();

  @ViewChild('textArea') textArea!: ElementRef<HTMLTextAreaElement>;

  constructor(
    public messageService: MessagesService,
    public memberService: MemberService,
    public auth: AuthenticationService,
    public threadService: ThreadService,
    public directMessage: DirectMessageService,
    private sanitizer: DomSanitizer
  ) { }

  autoGrow() {
    const textarea = this.textArea.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.save();
    } else if (event.key === 'Escape') {
      this.cancel();
    }
  }

  save() {
    if (this.isThread) {
      this.threadService.updateThreadMessage(this.editMessageText, this.message.threadId);
    } else if (this.directMessage.isDirectMessage) {
      this.directMessage.updateDirectMessage(this.message.messageId, this.editMessageText);
    } else {
      this.messageService.updateMessage(this.message.messageId, this.editMessageText);
    }
    this.saveText.emit();
  }

  cancel() {
    this.cancelEdit.emit();
  }

  highlightAtTags(text: string): SafeHtml {
    if (!text) return '';
    const validNames = this.memberService.allMembersNames;
    const color = this.messageService.checkUser(this.message) ? 'blue' : 'var(--text-blue)';
    const regexAtTags = /@([a-zA-Z]+(?:\s[a-zA-Z]+)?)/g;
    // Highlight @tags
    let highlightedText = text.replace(regexAtTags, (match, name) => {
      const plainName = name.trim();
      if (validNames.includes(plainName)) {
        return `<span style="color: ${color};">${match}</span>`;
      }
      return match;
    });
    // Highlight searchQuery
    const searchQuery = this.messageService.searchQuery; // Zugriff auf searchQuery aus dem messageService
    if (searchQuery) {
      const regexSearchQuery = new RegExp(`(${searchQuery})`, 'gi'); // Case-insensitive Suche
      highlightedText = highlightedText.replace(regexSearchQuery, '<span class="highlight">$1</span>');
    }
    return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  }
  
  // highlightAtTags(text: string): SafeHtml {
  //   if (!text) return '';
  //   const validNames = this.memberService.allMembersNames;
  //   const color = this.messageService.checkUser(this.message) ? 'blue' : 'var(--text-blue)';
  //   const regex = /@([a-zA-Z]+(?:\s[a-zA-Z]+)?)/g;
  //   const highlightedText = text.replace(regex, (match, name) => {
  //     const plainName = name.trim();
  //     if (validNames.includes(plainName)) {
  //       return `<span style="color: ${color};">${match}</span>`;
  //     }
  //     return match;
  //   });
  //   return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
  // }
}
