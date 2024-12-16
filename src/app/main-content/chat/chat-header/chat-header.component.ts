import { Component, ElementRef, inject, OnInit, Renderer2} from '@angular/core';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import { EditChannelComponent } from '../../../dialog/edit-channel/edit-channel.component';
import { MatIcon } from '@angular/material/icon';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DirectMessageService } from '../../../../services/directMessage/direct-message.service';
import { MemberService } from '../../../../services/member/member.service';
import { AddMembersChannelComponent } from '../../../dialog/add-members-channel/add-members-channel.component';
import { Channel } from '../../../../classes/channel.class';
import { ChannelService } from '../../../../services/channel/channel.service';
import { ShowMembersOfChannelComponent } from '../../../dialog/show-members-of-channel/show-members-of-channel.component';
import { MessagesService } from '../../../../services/messages/messages.service';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { Member, Message } from '../../../../interface/message';


@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIcon,
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat-header.component.html',
  styleUrls: ['../../../shared/header/searchbar/searchbar.component.scss', './chat-header.component.scss']
})
export class ChatHeaderComponent implements OnInit {
  searchQuery = ''; 
  members: Member[] = [];
  channels: Channel[] = [];
  showDropdown = false;
  activeDropdownIndex = -1; // Aktives Element im Dropdown
  previousSearchChannel: Channel | null = null;
  searchChanges$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  searchMember = false;
  allMembersInDevSpace$: Member[] = [];

  readonly dialog = inject(MatDialog);
  channel!: Channel | null;


  constructor( 
    public auth: AuthenticationService,
    public directMessageService: DirectMessageService,
    public memberService: MemberService,
    public channelService: ChannelService,
    public messageService: MessagesService,
    private renderer: Renderer2, 
    private elRef: ElementRef,
  ) {
  }

  async ngOnInit() {
    this.channel = await this.channelService.getChannelById(this.channelService.currentChannelId);
    this.memberService.allChannelMembers = await this.memberService.allMembersInChannel();
    this.initializeSearchListeners();
  }

  ngAfterViewInit() {
    this.addGlobalClickEventListener();
  }
  
  addGlobalClickEventListener() {
    document.addEventListener('click', (event: MouseEvent) => {
      const inputElement = this.elRef.nativeElement.querySelector('input');
      const dropdownElement = this.elRef.nativeElement.querySelector('.dropdown');
      const clickedInsideInput = inputElement?.contains(event.target as Node);
      const clickedInsideDropdown = dropdownElement?.contains(event.target as Node);
      if (!clickedInsideInput && !clickedInsideDropdown) {
        this.hideDropdown();
      }
    });
  }
  
  
  onDropdownItemClick(index: number) {
    this.activeDropdownIndex = index;
    this.selectDropdownItem(); 
  }

  
  initializeSearchListeners() {
    this.auth.currentMember$.pipe(
      filter(currentMember => !!currentMember),
      switchMap(currentMember => {
        if (!currentMember) {
          console.error('No current user is signed in.');
          return of([]); 
        }
        const members$ = this.memberService.getAllMembersFromFirestoreObservable();
        const channels$ = this.channelService.getAllAccessableChannelsFromFirestoreObservable(currentMember);
        return this.searchChanges$.pipe(
          debounceTime(300), 
          distinctUntilChanged(),
          switchMap(query => this.processSearchQuery(query, members$, channels$))
        );
      })
    ).subscribe(() => {
      this.showDropdown = this.members.length > 0 || this.channels.length > 0;
    });
  }


  onSearchInput(query: string) {
    this.searchQuery = query.trim();
    this.searchChanges$.next(this.searchQuery);
  }
  
  
  async processSearchQuery(
    query: string,
    members$: Observable<Member[]>,
    channels$: Observable<Channel[]>
  ) {
    this.members = [];
    this.channels = [];
    const selectedMemberIds = this.getSelectedMemberIds();
    const selectedChannelIds = this.getSelectedChannelIds();
    if (query.startsWith('@')) {
      this.searchMember = true;
      this.members = await this.filterMembersByName(query, members$, selectedMemberIds);
    } 
    else if (query.length > 1) {
      this.searchMember = false;
      this.members = await this.filterMembersByEmail(query, members$, selectedMemberIds);
    } 
    else if (query.startsWith('#')) {
      this.channels = await this.filterChannels(query, channels$, selectedChannelIds);
    }
  }
  
  async filterChannels(query: string, channels$: Observable<Channel[]>, selectedChannelIds: string[]): Promise<Channel[]> {
    const channels = await firstValueFrom(channels$);
    return channels.filter(channel =>
      channel.title.toLowerCase().includes(query.slice(1).toLowerCase()) &&
      !selectedChannelIds.includes(channel.id)
    );
  }
  
  async filterMembersByEmail(query: string, members$: Observable<Member[]>, selectedMemberIds: string[]): Promise<Member[]> {
    const members = await firstValueFrom(members$);
    return members.filter(member =>
      member.email.toLowerCase().includes(query.toLowerCase()) &&
      !selectedMemberIds.includes(member.id)
    );
  }
  
  async filterMembersByName(query: string, members$: Observable<Member[]>, selectedMemberIds: string[]): Promise<Member[]> {
    const members = await firstValueFrom(members$);
    return members.filter(member =>
      member.name.toLowerCase().includes(query.slice(1).toLowerCase()) &&
      !selectedMemberIds.includes(member.id)
    );
  }
  
  private getSelectedMemberIds(): string[] {
    return this.messageService.selectedObjects
      .filter(obj => obj.type === 'member' || obj.type === 'email')
      .map(obj => (obj.value as Member).id);
  }

  private getSelectedChannelIds(): string[] {
    return this.messageService.selectedObjects
      .filter(obj => obj.type === 'channel')
      .map(obj => (obj.value as Channel).id);
  }
  


  hideDropdown() {
    setTimeout(() => {
      this.showDropdown = false;
      this.activeDropdownIndex = -1;
    }, 200);
  }

  navigateDropdown(direction: number) {
    if (!this.showDropdown) return;
    const totalResults = this.members.length + this.channels.length;
    this.activeDropdownIndex = (this.activeDropdownIndex + direction + totalResults) % totalResults;
    this.setActiveDropdownIndex(this.activeDropdownIndex);
  }
  

  selectDropdownItem() {
    if (this.activeDropdownIndex < 0) {
      this.showDropdown = false;
      return;
    }
      else{
        let selectedItem: Member | Channel | Message | null = null;
        let itemType: string = '';
        if (this.activeDropdownIndex < this.members.length && this.searchMember) {
          selectedItem = this.members[this.activeDropdownIndex];
          itemType = 'member';
        }  else if (this.activeDropdownIndex < this.members.length && !this.searchMember) {
          selectedItem = this.members[this.activeDropdownIndex];
          itemType = 'email';
        } else if (this.activeDropdownIndex < this.channels.length) {
          selectedItem = this.channels[this.activeDropdownIndex];
          itemType = 'channel';
        }
        if (selectedItem) {
          this.handleSelectItem(selectedItem, itemType);
          this.activeDropdownIndex = -1;
        }
      }
  }

  handleSelectItem(selectedItem: Member | Channel , itemType: string) {
    let label = '';
    if (itemType === 'channel') {
      label = `#${(selectedItem as Channel).title}`;
    } else if (itemType === 'member') {
      label = `@${(selectedItem as Member).name}`;
    } else if (itemType === 'email') {
      label = `${(selectedItem as Member).email}`; 
    } 
    this.messageService.selectedObjects.push({ label, type: itemType, value: selectedItem });
    this.searchQuery = '';
    this.members = [];
    this.channels = [];
    this.onSearchInput(this.searchQuery);
    this.showDropdown = false;
  }


  setActiveDropdownIndex(index: number) {
    this.activeDropdownIndex = index;
    const dropdownElement = this.elRef.nativeElement.querySelector('.dropdown');
    const allElements = dropdownElement?.querySelectorAll('.dropDownItem') || []; 
    const activeElement = allElements[index] as HTMLElement;
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  removeChip(index: number) {
    this.messageService.selectedObjects.splice(index, 1);
  }
  
  /////////////////

  openEditChannel(): void {
    const buttonElement = document.activeElement as HTMLElement; 
    buttonElement.blur();
    if (window.innerWidth <= 600) {
      const dialogRef = this.dialog.open(EditChannelComponent, {
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
    const dialogRef = this.dialog.open(EditChannelComponent);
    dialogRef.afterClosed().subscribe();
    }
  }

  addMembersToChannel(): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); 
    if (window.innerWidth <= 450) {
      const dialogRef = this.dialog.open(AddMembersChannelComponent, {
        width: '294px',
        height: 'auto',
        position: { top: '100px', right: '16px'},
        autoFocus: false,
        panelClass: 'custom-dialog'
      });
      dialogRef.afterClosed().subscribe();
    } else {
    const dialogRef = this.dialog.open(AddMembersChannelComponent, {
      width: '360px',
      height: 'auto',
      position: { top: '400px', right: '64px' },
      autoFocus: false,
      panelClass: 'custom-dialog'
    });
    dialogRef.afterClosed().subscribe();
    } 
  }

  showMembersOfChannel(): void {
    const buttonElement = document.activeElement as HTMLElement;
    buttonElement.blur(); 
    if (window.innerWidth <= 450) {
      const dialogRef = this.dialog.open(ShowMembersOfChannelComponent, {
        width: '260px',
        height: 'auto',
        position: { top: '40px', right: '16px'},
        autoFocus: false,
        panelClass: 'custom-dialog'
      });
      dialogRef.afterClosed().subscribe(); 
    } else {
    const dialogRef = this.dialog.open(ShowMembersOfChannelComponent, {
      width: '400px',
      height: 'auto',
      position: { top: '200px', right: '64px' },
      autoFocus: false,
      panelClass: 'custom-dialog'
    });
    dialogRef.afterClosed().subscribe();      
    }
  }

  handleClickToShowOrAddMembers(): void {
    if (window.innerWidth <= 450) {
      this.showMembersOfChannel();
    } else {
      this.addMembersToChannel();
    }
  }
  
}
