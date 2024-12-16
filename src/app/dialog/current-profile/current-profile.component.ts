import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MessageNameComponent } from '../../main-content/message/message-name/message-name.component';
import { MatIcon } from '@angular/material/icon';
import { MemberService } from '../../../services/member/member.service';
import { CommonModule } from '@angular/common';
import { DirectMessageService } from '../../../services/directMessage/direct-message.service';
import { MessagesService } from '../../../services/messages/messages.service';
import { ChannelService } from '../../../services/channel/channel.service';
import { MainContentService } from '../../../services/main-content/main-content.service';

@Component({
  selector: 'app-current-profile',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatIcon,
    CommonModule,
  ],
  templateUrl: './current-profile.component.html',
  styleUrl: './current-profile.component.scss'
})
export class CurrentProfileComponent {
  readonly dialogRef = inject(MatDialogRef<MessageNameComponent>);
  readonly data = inject(MAT_DIALOG_DATA);
  currentMemberProfile: any;

  constructor(
    public memberService: MemberService,
    public directMessageService: DirectMessageService,
    private messageService: MessagesService,
    private channelService: ChannelService,
    private mainContentService: MainContentService
  ) {
    this.currentMemberProfile = this.memberService.currentProfileMember
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  openDirectMessage(memberId: any) {
    if (window.innerWidth < 450) {
      this.channelService.currentChannelId = '';
    }
    this.messageService.isWriteAMessage = false;
    this.directMessageService.isDirectMessage = true;
    this.memberService.setCurrentMemberData();
    this.directMessageService.readDirectUserData(memberId);
    if (window.innerWidth < 450) {
      this.mainContentService.closeNavBar();
      this.mainContentService.makeChatAsTopLayer();
    }
    this.dialogRef.close();
  }
}
