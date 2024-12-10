import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessagesService } from '../../../../services/messages/messages.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { DirectMessageService } from '../../../../services/directMessage/direct-message.service';
import { ThreadService } from '../../../../services/thread/thread.service';
import { MainContentService } from '../../../../services/main-content/main-content.service';

@Component({
  selector: 'app-message-reaction',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

  ],
  templateUrl: './message-reaction.component.html',
  styleUrl: './message-reaction.component.scss'
})
export class MessageReactionComponent {
  @Input() message: any;
  @Input() isThread: boolean = false;
  cachedReactions: { name: string; count: number }[] = [];

  constructor(
    public messageService: MessagesService,
    public auth: AuthenticationService,
    public directMessage: DirectMessageService,
    private threadService: ThreadService,
    private mainContentService: MainContentService) { }

  ngOnInit() {
    this.updateReactions(); 
  }

  reactionMessage(reaction: string) {
    if (this.isThread) {
      this.threadService.reaction(reaction, this.message.threadId)
    } else if (this.directMessage.isDirectMessage) {
      this.directMessage.reaction(reaction, this.message.messageId)
    } else {
      this.messageService.reaction(reaction, this.message.messageId);
      this.mainContentService.hideThread();
    }
  }

  updateReactions() {
    const re = this.message.reactions;
    this.cachedReactions = Object.keys(re)
      .filter(key => key !== 'rocket' && key !== 'like')
      .map(key => ({ name: key, count: re[key].length }));
  }

  checkReactionName(message: any[]) {
    let reactionNames: any = [];
    message.forEach(names => {
      reactionNames.push(names.name)
    })
    let namesString: any = reactionNames.join(" and ")
    return namesString
  }

  checkReactionNameEm(reactions: any, emoji: string): string {
    if (!reactions[emoji] || !Array.isArray(reactions[emoji])) {
      return '';
    }
    const names = reactions[emoji].map((reaction: any) => reaction.name);
    if (names.length > 3) {
      return `${names.slice(0, 3).join(' and ')} and ...`;
    }
    return names.join(' and ');
  }


}
