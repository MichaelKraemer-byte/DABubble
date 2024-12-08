import { Component, ElementRef, EventEmitter, Input, Output, Renderer2 } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { Channel } from '../../../../../classes/channel.class';
import { Member, Message } from '../../../../../interface/message';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../../../../services/authentication/authentication.service';

@Component({
  selector: 'app-dropdown-searchbar',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule
  ],
  templateUrl: './dropdown-searchbar.component.html',
  styleUrl: './dropdown-searchbar.component.scss'
})
export class DropdownSearchbarComponent {

  currentMember$;
  
  @Input() searchQuery: string = '';
  @Input() searchbarMember: Member[] = [];
  @Input() searchbarChannel: Channel[] = [];
  @Input() messages: Message[] = [];
  @Input() showDropdown: boolean = false;
  @Input() displayHints: boolean = false;
  @Input() allHints: string[] = [];
  @Input() activeDropdownIndex: number = -1;

  @Output() itemSelected = new EventEmitter<{ item: Member | Channel | Message | string, type: string }>();

  constructor(private elRef: ElementRef,
    private authenticationService:  AuthenticationService
  ) {
    this.currentMember$ = this.authenticationService.currentMember$;
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

  // onDropdownItemClick(index: number) {
  //   const totalMembers = this.searchbarMember.length;
  //   const totalChannels = this.searchbarChannel.length;

  //   let selectedItem: Member | Channel | Message | null = null;
  //   let itemType: string = '';

  //   if (this.displayHints && index < this.allHints.length) {
  //       return;
  //   } else {
  //       if (index < totalMembers) {
  //           selectedItem = this.searchbarMember[index];
  //           itemType = 'member';
  //       } else if (index < totalMembers + totalChannels) {
  //           selectedItem = this.searchbarChannel[index - totalMembers];
  //           itemType = 'channel';
  //       } else {
  //           selectedItem = this.messages[index - totalMembers - totalChannels];
  //           itemType = 'message';
  //       }
  //   }

  //   if (selectedItem) {
  //       this.itemSelected.emit({ item: selectedItem, type: itemType });
  //   }
  // }

  selectDropdownItem() {
    const totalHints = this.allHints.length;
    const totalMembers = this.searchbarMember.length;
    const totalChannels = this.searchbarChannel.length;
    if (this.activeDropdownIndex < 0) return;
    if (this.displayHints && this.activeDropdownIndex < totalHints) {
      const hint = this.allHints[this.activeDropdownIndex];
      if (hint.includes('@')) {
        this.itemSelected.emit({ item: '@', type: 'hint' });
      } else if (hint.includes('#')) {
        this.itemSelected.emit({ item: '#', type: 'hint' });
      }
      return;
    }
    let selectedItem: Member | Channel | Message | null = null;
    let itemType: string = '';
    if (this.activeDropdownIndex < totalMembers) {
      selectedItem = this.searchbarMember[this.activeDropdownIndex];
      itemType = 'member';
    } else if (this.activeDropdownIndex < totalMembers + totalChannels) {
      selectedItem = this.searchbarChannel[this.activeDropdownIndex - totalMembers];
      itemType = 'channel';
    } else {
      selectedItem = this.messages[this.activeDropdownIndex - totalMembers - totalChannels];
      itemType = 'message';
    }
    if (selectedItem) {
      this.itemSelected.emit({ item: selectedItem, type: itemType });
    }
  }
}
