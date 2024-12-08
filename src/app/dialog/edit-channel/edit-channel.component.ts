import { Component, inject } from '@angular/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChatHeaderComponent } from '../../main-content/chat/chat-header/chat-header.component';
import { ChannelService } from '../../../services/channel/channel.service';
import { Channel } from '../../../classes/channel.class';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MemberService } from '../../../services/member/member.service';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { Member } from '../../../interface/message';
import { MessagesService } from '../../../services/messages/messages.service';
import { ShowMembersOfChannelComponent } from '../show-members-of-channel/show-members-of-channel.component';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule, 
    MatButtonModule, 
    MatDialogModule,
    CommonModule,
    MatIcon,
    ShowMembersOfChannelComponent
  ],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss'
})
export class EditChannelComponent {
  readonly dialogRef = inject(MatDialogRef<ChatHeaderComponent>);
  newChannel: Channel = new Channel();
  channelCreator!: string | null;
  currentMember!: Member[] | null;
  editIsOpen: boolean = false;
  previousChannel: Channel = new Channel();


  constructor(
    private channelService: ChannelService,
    private memberService: MemberService,
    public authenticationService: AuthenticationService,
    private messageService: MessagesService
  ) {
  }

  async ngOnInit(){
    const fetchedChannel = await this.channelService.getChannelById(this.channelService.currentChannelId);
    if (fetchedChannel) {
      this.previousChannel = fetchedChannel;
      this.newChannel = {
        ...fetchedChannel}
    } else {
      throw new Error('Channel not found');
    }
    const creator = await this.memberService.search(fetchedChannel.admin);
    if (creator) {
      this.channelCreator = creator.name;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  openEditChannel(){
    this.editIsOpen = !this.editIsOpen;
  }

  async saveNewChannel() {
    try {
      await this.channelService.updateChannelDetails(this.channelService.currentChannelId, {
        title: this.newChannel.title,
        description: this.newChannel.description,
      });
      this.previousChannel.title = this.newChannel.title;
      this.previousChannel.description = this.newChannel.description;
      this.editIsOpen = false;
    } catch (error) {
      console.error('Failed to update channel:', error);
    }
  }

  async leaveChannel() {
    this.authenticationService.currentMember$.subscribe(async (currentMember) => {
      if (!currentMember || !this.previousChannel) {
        return;
      }
      if (!this.previousChannel.isPublic) {
        await this.memberService.removeChannelIdFromMember(currentMember.id, this.previousChannel.id);
        await this.channelService.removeMemberIdFromChannel(currentMember.id, this.previousChannel.id);
      } else {
        await this.memberService.addChannelIdToIgnoreList(currentMember.id, this.previousChannel.id);
      }
    });
    this.channelService.currentChannelId = 'uZaX2y9zpsBqyaOddLWh';
    await this.messageService.readChannel();
    this.dialogRef.close();
  }

  isWindowLowerThan600(){
   return  window.innerWidth<= 600
  }
}