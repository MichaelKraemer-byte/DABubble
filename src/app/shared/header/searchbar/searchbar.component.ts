import { Component, ElementRef, HostListener, Renderer2, Input} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MemberService } from '../../../../services/member/member.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { ChannelService } from '../../../../services/channel/channel.service';
import { MessagesService } from '../../../../services/messages/messages.service';
import { Channel } from '../../../../classes/channel.class';
import { Member, Message } from '../../../../interface/message';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, firstValueFrom, Observable, of, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { DirectMessageService } from '../../../../services/directMessage/direct-message.service';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [
    MatIconModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './searchbar.component.html',
  styleUrl: './searchbar.component.scss'
})
export class SearchbarComponent {
  searchQuery = ''; 
  members: Member[] = [];
  channels: Channel[] = [];
  messages: Message[] = [];
  showDropdown = false;
  displayHints = false;
  activeDropdownIndex = -1; // Aktives Element im Dropdown
  previousSearchChannel: Channel | null = null;
  searchChanges$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  currentMember$;

  allHints = [
    "Type '@' to search for members.",
    "Type '#' to search for channels.",
    "Select a Channel with '#' and search for messages."
  ];


  constructor(
    private renderer: Renderer2, 
    private elRef: ElementRef,
    public memberService: MemberService,
    private authenticationService: AuthenticationService,
    private channelService: ChannelService,
    private messageService: MessagesService,
    private directMessageService: DirectMessageService

  ) {
    this.currentMember$ = this.authenticationService.currentMember$;
  }

  @Input() icon: string = 'search'; 
  @Input() addClass: string[] = [];
  @Input() placeholder: string = 'Search in Devspace'; 
  @Input() align_reverse: boolean = false;

  @HostListener('focusin', ['$event'])
  onFocusIn(event: Event): void {
    const parent = this.elRef.nativeElement.querySelector('.searchbar');
    this.renderer.addClass(parent, 'active');
  }

  @HostListener('focusout', ['$event'])
  onFocusOut(event: Event): void {
    const parent = this.elRef.nativeElement.querySelector('.searchbar');
    this.renderer.removeClass(parent, 'active');
  }

  ngOnInit() {
    this.initializeSearchListeners();
  }

  ngAfterViewInit() {
    // Zugriff auf die Dropdown-Elemente nach dem View-Init
    this.addGlobalClickEventListener();
  }
  
  addGlobalClickEventListener() {
    document.addEventListener('click', (event: MouseEvent) => {
      const inputElement = this.elRef.nativeElement.querySelector('input');
      const dropdownElement = this.elRef.nativeElement.querySelector('.dropdown');
      
      const clickedInsideInput = inputElement?.contains(event.target as Node);
      const clickedInsideDropdown = dropdownElement?.contains(event.target as Node);
  
      // Wenn weder auf das Eingabefeld noch auf das Dropdown geklickt wurde, Dropdown schließen
      if (!clickedInsideInput && !clickedInsideDropdown) {
        this.hideDropdown();
      }
    });
  }
  
  
  onDropdownItemClick(index: number) {
    this.activeDropdownIndex = index;
    this.selectDropdownItem(); // Setzt die Logik fort, um das richtige Element auszuwählen
  }

  
  initializeSearchListeners() {
    this.authenticationService.currentMember$.pipe(
      filter(currentMember => !!currentMember), // Nur fortfahren, wenn der Benutzer verfügbar ist
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
      this.showDropdown = this.members.length > 0 || this.channels.length > 0 || this.messages.length > 0;
    });
  }


  onSearchInput(query: string) {
    this.searchQuery = query.trim();
    this.searchChanges$.next(this.searchQuery);
    this.displayHints = !this.searchQuery.trim(); 
    this.toggleHintsBasedOnInput(query);
  }
  

  toggleHintsBasedOnInput(query: string) {
    if (query === '') {
      this.messageService.readChannel();
      this.messageService.isSearchForMessages = false;
      this.displayHints = true;
    } else {
      this.displayHints = false;
    }
  }
  
  
  async processSearchQuery(
    query: string, 
    members$: Observable<Member[]>, 
    channels$: Observable<Channel[]>
  ): Promise<void> {
    this.members = [];
    this.channels = [];
    this.messages = [];
    if (query.startsWith('@')) {
      await this.searchMembers(query, members$);
    } 
    else if (query.startsWith('#')) {
      await this.searchChannels(query, channels$);
    }
    await this.searchMessages(query);
  }
  

  async searchMessages(query: string): Promise<void> {
    if (this.previousSearchChannel && query.includes(' ')) {
      const channelTitle = this.previousSearchChannel.title.toLowerCase(); 
      const searchQuery = query.toLowerCase().replace(`#${channelTitle}`, '').trim(); 
      const allMessages = await this.messageService.loadInitialMessagesByChannelId(this.previousSearchChannel.id);
      this.messages = allMessages.filter((message: Message) =>
        message.message.toLowerCase().includes(searchQuery)
      );
      this.messageService.isSearchForMessages = true;
      this.messageService.messages = this.messages;
      this.messageService.searchQuery = searchQuery;
      this.messageService.messagesUpdated.next();
    }
  }
  

  async searchChannels(query: string, channels$: Observable<Channel[]>): Promise<void> {
    const channels = await firstValueFrom(channels$);
    this.channels = channels.filter(channel =>
      channel.title.toLowerCase().includes(query.slice(1).toLowerCase()) &&
      (!this.previousSearchChannel || channel.id !== this.previousSearchChannel.id) // Aktuellen Channel ausschließen
    );
  }
  

  async searchMembers(query: string, members$: Observable<Member[]>): Promise<void> {
    const members = await firstValueFrom(members$);
    this.members = members.filter(member =>
      member.name.toLowerCase().includes(query.slice(1).toLowerCase())
    );
  }
  


  showHints() {
    if (!this.searchQuery.trim()) {
      this.members = [];
      this.channels = [];
      this.messages = [];
      this.displayHints = true;
      this.showDropdown = true;
    }
  }

  hideDropdown() {
    setTimeout(() => {
      this.displayHints = false;
      this.showDropdown = false;
      this.activeDropdownIndex = -1;
    }, 200);
  }

  navigateDropdown(direction: number) {
    if (!this.showDropdown && !this.displayHints) return;
    const totalResults = this.displayHints ? this.allHints.length : this.members.length + this.channels.length + this.messages.length;
    this.activeDropdownIndex = (this.activeDropdownIndex + direction + totalResults) % totalResults;
    this.setActiveDropdownIndex(this.activeDropdownIndex);
  }
  

  selectDropdownItem(): void {
    if (this.activeDropdownIndex < 0) return;
    if (this.activeDropdownIndex < this.allHints.length && this.displayHints) {
      const hint = this.allHints[this.activeDropdownIndex];
      if (hint.includes('@')) {
        this.setSearchForMembers();
      } 
      else if (hint.includes('#')) {
        this.setSearchForChannels();
      }
      this.displayHints = false;  
    } 
    else if (!this.displayHints) {
      let selectedItem: Member | Channel | Message | null = null;
      let itemType: string = '';
      if (this.activeDropdownIndex < this.members.length) {
        selectedItem = this.members[this.activeDropdownIndex];
        itemType = 'member';
      } 
      else if (this.activeDropdownIndex < this.channels.length) {
        selectedItem = this.channels[this.activeDropdownIndex];
        itemType = 'channel';
      } 
      else if (this.activeDropdownIndex < this.messages.length) {
        selectedItem = this.messages[this.activeDropdownIndex];
        itemType = 'message';
      }
      if (selectedItem) {
        this.selectItem(selectedItem, itemType);
      }
    }
  }
  
  private setSearchForMembers(): void {
    this.searchQuery = '@';  
    this.onSearchInput(this.searchQuery);
    this.members = []; 
    this.showDropdown = true;
  }

  private setSearchForChannels(): void {
    this.searchQuery = '#';  
    this.onSearchInput(this.searchQuery);
    this.channels = [];  
    this.showDropdown = true;
  }
  
  private selectItem(selectedItem: Member | Channel | Message, itemType: string): void {
    this.handleSelectItem(selectedItem, itemType);
    this.activeDropdownIndex = -1;
  }  


  handleSelectItem(selectedItem: Member | Channel | Message, itemType: string): void {
    if (itemType === 'channel') {
      this.handleChannelSelection(selectedItem as Channel);
    } else if (itemType === 'member') {
      this.handleMemberSelection(selectedItem as Member);
    } else if (itemType === 'message') {
      this.handleMessageSelection(selectedItem as Message);
    }
    this.members = [];
    this.channels = [];
    this.messages = [];
    this.showDropdown = false;
    this.displayHints = false;
  }
  
  
  handleChannelSelection(selectedChannel: Channel): void {
    this.messageService.isWriteAMessage = false;
    this.directMessageService.isDirectMessage = false;
    this.previousSearchChannel = selectedChannel;
    this.searchQuery = `#${selectedChannel.title} `;
    this.channelService.currentChannelId = selectedChannel.id;
    this.messageService.readChannel();
  }
  
  
  handleMemberSelection(selectedMember: Member): void {
    this.searchQuery = `@${selectedMember.name} `;
    this.memberService.openProfileUser(selectedMember.id);
  }
  
  
  handleMessageSelection(selectedMessage: Message): void {
    this.messageService.isWriteAMessage = false;
    this.directMessageService.isDirectMessage = false;
    this.searchQuery = `#${this.previousSearchChannel?.title} ${selectedMessage.message}`;
    this.onSearchInput(this.searchQuery);
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
  
}