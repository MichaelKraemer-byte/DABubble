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
import { firstValueFrom, lastValueFrom, take } from 'rxjs';
import { doc, getDoc } from '@firebase/firestore';
import { ReferencesService } from '../../../services/references/references.service';

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
  channelNameAlreadyExists: boolean = false;
  previousChannel: Channel = new Channel();
  currentMember$;

  constructor(
    private channelService: ChannelService,
    private memberService: MemberService,
    public authenticationService: AuthenticationService,
    private messageService: MessagesService,
    private referencesService: ReferencesService
  ) {
    this.currentMember$ = this.authenticationService.currentMember$;
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

  checkChannelAndSaveOrDeny() {
    firstValueFrom(this.currentMember$).then(currentMember => {
      if (!currentMember) throw new Error('No current member found');
      const channels$ = this.channelService.getAllAccessableChannelsFromFirestoreObservable(currentMember);
      channels$.pipe(
        take(1) 
      ).subscribe({
        next: channels => {
          const channelNameExists = channels.some(channel => channel.title === this.newChannel.title);
          if (channelNameExists) {
            this.channelNameAlreadyExists = true;
            console.warn('Channel name already exists!');
            return;
          } else {
            this.channelNameAlreadyExists = false;
            this.saveNewChannel();
          }
        },
        error: error => {
          console.error('Error fetching channels:', error);
        }
      });
    }).catch(error => {
      console.error('Error in currentMember$ subscription:', error);
    });
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

      const channel = await getDoc(this.referencesService.getChannelDocRef());
      const channelData = channel.data();
      this.authenticationService.currentChannelData$.next(channelData);

    } catch (error) {
      console.error('Failed to update channel:', error);
    }
  }

  async leaveChannel() {
    const currentMember = await firstValueFrom(this.authenticationService.currentMember$);
    if (!this.previousChannel.isPublic && currentMember) {
      await this.memberService.removeChannelIdFromMember(currentMember.id, this.previousChannel.id);
      await this.channelService.removeMemberIdFromChannel(currentMember.id, this.previousChannel.id);
    } else if (currentMember) {
      await this.memberService.addChannelIdToIgnoreList(currentMember.id, this.previousChannel.id);
    } 
    this.channelService.currentChannelId = 'uZaX2y9zpsBqyaOddLWh';
    await this.messageService.readChannel();
    this.dialogRef.close();
  }

  isWindowLowerThan600(){
   return  window.innerWidth<= 600
  }
}