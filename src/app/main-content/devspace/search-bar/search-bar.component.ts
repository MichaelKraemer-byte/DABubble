import { Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Member, Message } from '../../../../interface/message';
import { Channel } from '../../../../classes/channel.class';
import { MatIcon } from '@angular/material/icon';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { DirectMessageService } from '../../../../services/directMessage/direct-message.service';
import { MainContentService } from '../../../../services/main-content/main-content.service';
import { ChannelService } from '../../../../services/channel/channel.service';
import { MemberService } from '../../../../services/member/member.service';
import { MessagesService } from '../../../../services/messages/messages.service';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, firstValueFrom, Observable, of, Subscription, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownSearchbarComponent } from './dropdown-searchbar/dropdown-searchbar.component';

@Component({
  selector: 'app-search-bar-for-devspace',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule,
    FormsModule,
    DropdownSearchbarComponent
  ],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponentDevSpace implements OnInit {
  
  @ViewChild(DropdownSearchbarComponent) dropdownComponent!: DropdownSearchbarComponent;
  @ViewChild('searchInput') searchInputElement!: ElementRef<HTMLInputElement>;

  nothingFound: boolean = false;

  searchQuery = ''; 
  showDropdown = false;
  displayHints = false;
  activeDropdownIndex = -1;
  previousSearchChannel: Channel | null = null;
  searchChanges$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  allHints = [
    "Type '@' for members.",
    "Type '#' for channels.",
    "Select a #Channel to search for messages."
  ];

  members: Member[] = [];
  channels: Channel[] = [];
  messages: Message[] = [];
  currentMember$;


  searchbarChannel: Channel[] = [];
  searchbarMember: Member[] = [];


    //Searchbar
    @Input() icon: string = 'search';
    @Input() addClass: string[] = [];
    @Input() placeholder: string = 'Search in Devspace';
    @Input() align_reverse: boolean = false;
    @HostListener('focusin', ['$event'])
    onFocusIn(event: Event): void {
      const parent = this.elRef.nativeElement.querySelector('.searchbar');
      if (parent) {
        this.renderer.addClass(parent, 'active');
      } else {
        console.warn('Element .searchbar nicht gefunden');
      }
    }
    @HostListener('focusout', ['$event'])
    onFocusOut(event: Event): void {
      const parent = this.elRef.nativeElement.querySelector('.searchbar');
      if (parent) {
        this.renderer.removeClass(parent, 'active');
      } else {
        console.warn('Element .searchbar nicht gefunden');
      }
    }
    ///////

  constructor(
    public messageService: MessagesService,
    private memberService: MemberService,
    private channelService: ChannelService,
    public mainContentService: MainContentService,
    public authenticationService: AuthenticationService,
    private renderer: Renderer2,
    private elRef: ElementRef,
    private directMessageService: DirectMessageService
  ){
    this.currentMember$ = this.authenticationService.currentMember$;
  }

  async ngOnInit() {
    this.authenticationService.observerUser();
  }

  onFocus(){
    this.showHints();
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

  
  initializeSearchListeners() {
    this.authenticationService.currentMember$.pipe(
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
      this.showDropdown = this.searchbarMember.length > 0 || this.searchbarChannel.length > 0 || this.messages.length > 0;
    });
  }


  toggleHintsBasedOnInput(query: string) {
    if (query === '') {
      this.messageService.readChannel();
      this.displayHints = true;
    } else {
      this.displayHints = false;
    }
  }


  // async processSearchQuery(
  //   query: string,
  //   members$: Observable<Member[]>,
  //   channels$: Observable<Channel[]>
  // ) {
  //   await this.filterMembersAndChannels(query, members$, channels$);
  //   await this.processMessagesForChosenChannels(query, channels$);
  //   await this.processMessagesInCurrentChannel(query);
  // }
  async processSearchQuery(
    query: string, 
    members$: Observable<Member[]>, 
    channels$: Observable<Channel[]>
  ) {
    this.members = [];
    this.channels = [];
    this.messages = [];
    if (query.startsWith('@')) {
      await this.searchMembers(query, members$);
    } 
    else if (query.startsWith('#')) {
      await this.searchChannels(query, channels$);
    } 
    else {
      if (!this.directMessageService.isDirectMessage) {
        await this.processMessagesInCurrentChannel(query);
      } else {
        await this.processDirectMessagesForCurrentDirectMessagesChannel(query);
      }
    }
    if (this.previousSearchChannel && query.includes(' ')) {
      await this.processMessagesForChosenChannels(query, channels$);
    }
    this.checkIfSomethingFound();
  }

    async processDirectMessagesForCurrentDirectMessagesChannel(query: string): Promise<void> {
    try {
      const currentChannelId = this.directMessageService.directMessageChannelId;
      if (!currentChannelId) {
        console.warn('No current channel accessable.');
        return;
      }
      const allMessages = await this.directMessageService.loadInitialDirectMessagesByDirectChannelId(currentChannelId);
      const searchQuery = query.toLowerCase().trim();
      this.messages = allMessages.filter((message: Message) =>
        message.message.toLowerCase().includes(searchQuery)
      );
      this.directMessageService.allDirectMessages = this.messages;
      this.messageService.searchQuery = searchQuery;
      this.directMessageService.messagesUpdated.next();
    } catch (error) {
      console.error('Error while searching for messages in the current channel:', error);
    }
  }

  async processMessagesInCurrentChannel(query: string): Promise<void> {
    try {
      const currentChannelId = this.channelService.currentChannelId;
      if (!currentChannelId) {
        console.warn('Kein aktueller Channel verfügbar.');
        return;
      }
      const allMessages = await this.messageService.loadInitialMessagesByChannelId(currentChannelId);
      const searchQuery = query.toLowerCase().trim();
      this.messages = allMessages.filter((message: Message) =>
        message.message.toLowerCase().includes(searchQuery)
      );
      this.messageService.messages = this.messages;
      this.messageService.searchQuery = searchQuery;
      this.messageService.messagesUpdated.next();
    } catch (error) {
      console.error('Error while searching for messages in the current channel:', error);
    }
  }

  async processMessagesForChosenChannels(query: string, channels$: Observable<Channel[]>) {
    this.messages = [];
    if ((this.previousSearchChannel && query.includes(' '))) {
      this.searchbarChannel = await this.filterChannelsForMessageSearch(query, channels$);
      const channelTitle = this.previousSearchChannel.title;
      const searchQuery = this.createSearchQuery(query, channelTitle);
      this.messages = await this.filterMessagesByQuery(this.previousSearchChannel.id, searchQuery);
      this.updateMessageService(this.messages, searchQuery);
    }
  }


  async filterChannelsForMessageSearch(
    query: string,
    channels$: Observable<Channel[]>
  ): Promise<Channel[]> {
    const channels = await firstValueFrom(channels$);
    return channels.filter(channel =>
      channel.title.toLowerCase().includes(query.slice(1).toLowerCase()) &&
      (!this.previousSearchChannel || channel.id !== this.previousSearchChannel.id)
    );
  }
  

  createSearchQuery(query: string, channelTitle: string): string {
    return query.toLowerCase().replace(`#${channelTitle.toLowerCase()}`, '').trim();
  }
  
  
  async filterMessagesByQuery(
    channelId: string,
    searchQuery: string
  ): Promise<Message[]> {
    const allMessages = await this.messageService.loadInitialMessagesByChannelId(channelId);
    return allMessages.filter((message: Message) =>
      message.message.toLowerCase().includes(searchQuery)
    );
  }
  

  updateMessageService(messages: Message[], searchQuery: string): void {
    this.messageService.messages = messages;
    this.messageService.searchQuery = searchQuery;
    this.messageService.messagesUpdated.next();
  }

  async searchMembers(
    query: string,
    members$: Observable<Member[]>,
  ){
    this.searchbarMember = [];
    const members = await firstValueFrom(members$);
    this.searchbarMember = members.filter(member =>
      member.name.toLowerCase().includes(query.slice(1).toLowerCase())
    );
  }

  async searchChannels(
    query: string,
    channels$: Observable<Channel[]>
  ){
    this.searchbarChannel = [];
    const channels = await firstValueFrom(channels$);
    this.searchbarChannel = channels.filter(channel =>
      channel.title.toLowerCase().includes(query.slice(1).toLowerCase())
    );
  }
  
  
  onSearchInput(query: string) {
    this.searchQuery = query.trim();
    this.searchChanges$.next(this.searchQuery);
    this.displayHints = !this.searchQuery.trim(); 
    this.toggleHintsBasedOnInput(query);
  }

  navigateDropdown(direction: number) {
    if (!this.showDropdown && !this.displayHints) return;
    const totalResults = this.displayHints ? this.allHints.length : this.searchbarMember.length + this.searchbarChannel.length + this.messages.length;
    this.activeDropdownIndex = (this.activeDropdownIndex + direction + totalResults) % totalResults;
    this.dropdownComponent.setActiveDropdownIndex(this.activeDropdownIndex);
  }


  handleItemSelected(event: { item: Member | Channel | Message | string, type: string }) {
    const { item, type } = event;
    switch (type) {
      case 'hint':
        this.handleHintSelection(item as string);
        break;
      case 'member':
        this.handleMemberSelection(item as Member);
        break;
      case 'channel':
        this.handleChannelSelection(item as Channel);
        break;
      case 'message':
        this.handleMessageSelection(item as Message);
        break;
      default:
        break;
    }
    this.activeDropdownIndex = -1;
  }
  

  handleHintSelection(item: string): void {
    this.searchQuery = item;
    this.onSearchInput(this.searchQuery);
    this.searchbarMember = [];
    this.searchbarChannel = [];
    this.showDropdown = true;
  }
  

  handleMemberSelection(item: Member): void {
    this.searchQuery = `@${item.name}`;
    this.memberService.openProfileUser(item.id);
  }
  

  handleChannelSelection(item: Channel): void {
    this.messageService.isWriteAMessage = false;
    this.directMessageService.isDirectMessage = false;
    this.searchQuery = `#${item.title}`;
    this.previousSearchChannel = item;
    this.channelService.currentChannelId = item.id;
    this.messageService.readChannel();
  }


  handleMessageSelection(item: Message): void {
    this.messageService.isWriteAMessage = false;
    this.directMessageService.isDirectMessage = false;
    const selectedMessage = item;
    if (!this.searchQuery.includes('@')) {
      this.searchQuery = `${selectedMessage.message}`;
    } else {
      this.searchQuery = `#${(this.previousSearchChannel as Channel).title} ${selectedMessage.message}`;
    }
    this.onSearchInput(this.searchQuery);
  }
  
  
  closeDevSpaceAndOpenChatForMobile(){
    this.mainContentService.closeNavBar();
    this.mainContentService.makeChatAsTopLayer();
  }

  showHints() {
    if (!this.searchQuery.trim()) {
      this.searchbarMember = [];
      this.searchbarChannel = [];
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

  checkIfSomethingFound() {
    const isNothingFound = this.searchbarMember.length === 0 
                          && this.searchbarChannel.length === 0 
                          && this.messages.length === 0
                          && !(this.searchQuery === '');
    if (isNothingFound) {
      this.nothingFound = true;
      return;
    } else {
      this.nothingFound = false;
    }
  }

  emptyInput(){
    this.searchInputElement.nativeElement.focus();
    this.nothingFound = false;
    this.showDropdown= false;
    this.displayHints = false;
    this.searchQuery = '';
  }
  
}
