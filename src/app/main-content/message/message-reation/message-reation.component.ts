import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessagesService } from '../../../../services/messages/messages.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { DirectMessageService } from '../../../../services/directMessage/direct-message.service';
import { ThreadService } from '../../../../services/thread/thread.service';

@Component({
  selector: 'app-message-reation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

  ],
  templateUrl: './message-reation.component.html',
  styleUrl: './message-reation.component.scss'
})
export class MessageReationComponent {
  @Input() message: any;
  @Input() isThread: boolean = false;

  constructor(
    public messageService: MessagesService,
    public auth: AuthenticationService,
    public directMessage: DirectMessageService,
    private threadService: ThreadService) { }

  reactionMessage(reaction: string) {
    if (this.isThread) {
      this.threadService.reaction(reaction, this.message.threadId)
    } else if (this.directMessage.isDirectMessage) {
      this.directMessage.reaction(reaction, this.message.messageId)
    } else {
      this.messageService.reaction(reaction, this.message.messageId)
    }
  }

  check() {
    const re = this.message.reactions;
    return Object.keys(re)
      .filter(key => key !== "rocket" && key !== "like")
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
