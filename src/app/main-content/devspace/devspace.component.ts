import { CommonModule } from '@angular/common';
import { Component, inject, OnInit} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { trigger, style, animate, transition, query } from '@angular/animations';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CreateChannelComponent } from '../../dialog/create-channel/create-channel.component';
import { Member } from '../../../interface/message';
import { MemberService } from '../../../services/member/member.service';
import { ChannelService } from '../../../services/channel/channel.service';
import { Channel } from '../../../classes/channel.class';
import { MainContentService } from '../../../services/main-content/main-content.service';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { MessagesService } from '../../../services/messages/messages.service';
import { DirectMessageService } from '../../../services/directMessage/direct-message.service';
import { combineLatest } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SearchBarComponentDevSpace } from './search-bar/search-bar.component';
import { ChannelListComponent } from "./channel-list/channel-list.component";
import { ContactListComponent } from "./contact-list/contact-list.component";


@Component({
  selector: 'app-devspace',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIcon,
    MatDialogModule,
    FormsModule,
    SearchBarComponentDevSpace,
    ChannelListComponent,
    ContactListComponent
],
  templateUrl: './devspace.component.html',
  styleUrl: './devspace.component.scss',
  animations: [
    trigger('toggleNavBar', [
      transition(':enter', [
        style({
          opacity: 0,
          overflow: 'hidden',
          transform: 'translateX(-100%)'
        }),
        animate(
          '125ms ease-out',
          style({
            opacity: 1,
            transform: 'translateX(0)'
          })
        ),
        query('.nav-item', [
          style({ opacity: 0, display: 'none' }),
          animate('125ms ease-out', style({ opacity: 1, display: 'block' }))
        ])
      ]),
      transition(':leave', [
        query('.nav-item', [
          style({ opacity: 1, display: 'block' }),
          animate('125ms ease-out', style({ opacity: 0, display: 'none' }))
        ]),
        animate(
          '125ms ease-in',
          style({
            opacity: 0,
            overflow: 'hidden',
            transform: 'translateX(-100%)'
          })
        )
      ])
    ])
  ]
})
export class DevspaceComponent implements OnInit {
  contactsAreVisible: boolean = true;
  channelsAreVisible: boolean = true;
  readonly dialog = inject(MatDialog);

  members: Member[] = [];
  channels: Channel[] = [];
  currentMember?: Member | null = null;
  currentMember$;


  constructor(
    public messageService: MessagesService,
    private memberService: MemberService,
    private channelService: ChannelService,
    public mainContentService: MainContentService,
    private directMessageService: DirectMessageService,
    private authenticationService: AuthenticationService) {
      this.currentMember$ = this.authenticationService.currentMember$;
  }


  async ngOnInit() {
    this.initializeMemberAndChannels(); 
    this.initializePublicChannels(); 
    this.authenticationService.observerUser();
  }
  

  initializeMemberAndChannels(): void {
    const members$ = this.memberService.getAllMembersFromFirestoreObservable();
    const currentMember$ = this.authenticationService.currentMember$;
  
    combineLatest([members$, currentMember$]).subscribe(([updatedMembers, currentMember]) => {
      this.currentMember = currentMember;
      this.members = this.memberService.prioritizeCurrentMember(updatedMembers, this.currentMember);
    });
  }
  
  initializePublicChannels(): void {
    this.authenticationService.currentMember$.subscribe((member) => {
      this.currentMember = member;
  
      this.channelService.getAllPublicChannelsFromFirestore((publicChannels: Channel[]) => {
        this.channels = this.filterIgnoredChannels(publicChannels);
        this.channelService.sortChannelsByDate(this.channels);
      });
  
      if (this.currentMember) {
        this.loadExclusiveChannels();
      }
    });
  }
  
  loadExclusiveChannels(): void {
    if (!this.currentMember) return;
  
    this.channelService.getAllChannelsWithChannelIdsFromCurrentUser(this.currentMember, (exclusiveChannels: Channel[]) => {
      this.channels = [
        ...exclusiveChannels,
        ...(this.channels || []).filter(channel => channel.isPublic),
      ];
      this.channelService.sortChannelsByDate(this.channels);
    });
  }
  
  filterIgnoredChannels(channels: Channel[]): Channel[] {
    if (!this.currentMember?.ignoreList) {
      return channels;
    }
    return channels.filter(channel => !this.currentMember?.ignoreList.includes(channel.id));
  }
  

  dropChannels() {
    this.channelsAreVisible = !this.channelsAreVisible;
  }

  dropContacts() {
    this.contactsAreVisible = !this.contactsAreVisible;
  }

  openCreateChannelDialog() {
    this.memberService.setCurrentMemberData();
    if (window.innerWidth <= 600) {
      const dialogRef = this.dialog.open(CreateChannelComponent, {
        width: '100vw',   
        height: '100vh',    
        maxWidth: '100vw',  
        maxHeight: '100vh',  
        position: { top: '0', left: '0' }, 
        autoFocus: false,
        panelClass: 'custom-dialog' 
      });
        dialogRef.afterClosed().subscribe();
    } else {
      const dialogRef = this.dialog.open(CreateChannelComponent);
      dialogRef.afterClosed().subscribe();
    }
  }

  openDirectMessage(memberId: any) {
    this.messageService.isWriteAMessage = false;
    this.directMessageService.isDirectMessage = true;
    this.memberService.setCurrentMemberData();
    this.directMessageService.readDirectUserData(memberId)
    if (window.innerWidth < 450) {
      this.mainContentService.closeNavBar();
      this.mainContentService.makeChatAsTopLayer();
    }
  }

  openWriteAMessage() {
    this.messageService.isWriteAMessage = true;
    if (window.innerWidth < 450) {
      this.mainContentService.closeNavBar();
      this.mainContentService.makeChatAsTopLayer()
    }
  }
}