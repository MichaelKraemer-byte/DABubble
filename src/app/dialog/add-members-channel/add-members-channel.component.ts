import { Component, inject, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ChatHeaderComponent } from '../../main-content/chat/chat-header/chat-header.component';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { map, Observable, startWith } from 'rxjs';
import { Member } from '../../../interface/message';
import { Channel } from '../../../classes/channel.class';
import { MemberService } from '../../../services/member/member.service';
import { ChannelService } from '../../../services/channel/channel.service';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-members-channel',
  standalone: true,
  imports: [
    MatIcon,
    CommonModule,
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule, 
    MatButtonModule, 
    MatDialogModule,
    FormsModule,
    MatFormField,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-members-channel.component.html',
  styleUrls: ['../../dialog/create-channel/choose-members-create-channel/choose-members-create-channel.component.scss', './add-members-channel.component.scss' ],
  encapsulation: ViewEncapsulation.None
})
export class AddMembersChannelComponent {
  readonly dialogRef = inject(MatDialogRef<ChatHeaderComponent>);
  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly announcer = inject(LiveAnnouncer);
  selectAllPeople = true; 
  myControl = new FormControl('');
  filteredMembers$: Observable<Member[]> = new Observable<Member[]>(); 

  channel: Channel = new Channel();
  members: Member[] = [];

  selectedMembers: Member[] = [];
  filteredMembers: Member[] = [];


  constructor(
    private memberService: MemberService,
    private channelService: ChannelService,
  ) {
  }

  
  async ngOnInit() {
    const fetchedChannel = await this.channelService.getChannelById(this.channelService.currentChannelId);
    if (fetchedChannel) {
      this.channel = fetchedChannel;
    } else {
      throw new Error('Channel not found');
    }
    this.memberService.getAllMembersFromFirestore((updatedMembers: Member[]) => {
      this.members = updatedMembers;
    });
    this.filteredMembers$ = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  private _filter(value: string): Member[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.members.filter(
      member =>
        member.name.toLowerCase().includes(filterValue) && 
        !this.selectedMembers.some(selected => selected.id === member.id) &&
        !this.channel.membersId.includes(member.id) 
    );
  }


  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    const memberToAdd = this.members.find(
      member => 
        member.name.toLowerCase() === value.toLowerCase() &&
        !this.selectedMembers.some(selected => selected.id === member.id)
    );
    if (memberToAdd) {
      this.selectedMembers.push(memberToAdd);
    }
    event.chipInput!.clear();
  }


  selected(event: MatAutocompleteSelectedEvent): void {
    const selectedMember: Member = event.option.value;
    // Überprüfen, ob das Mitglied noch nicht ausgewählt wurde
    if (!this.selectedMembers.some(member => member.id === selectedMember.id)) {
      this.selectedMembers.push(selectedMember);
    }
    // Leere das Eingabefeld
    this.myControl.setValue('');
  }


  remove(member: Member): void {
    const index = this.selectedMembers.indexOf(member);
    if (index >= 0) {
      this.selectedMembers.splice(index, 1);
      this.announcer.announce(`Mitglied ${member.name} entfernt`);
    }
  }


  edit(member: Member, event: MatChipEditedEvent): void {
    const value = event.value.trim();
    if (!value) {
      this.remove(member);
      return;
    }
    const index = this.selectedMembers.indexOf(member);
    if (index >= 0) {
      this.selectedMembers[index].name = value;
    }
  }


  async addSelectedMembers() {
    this.selectedMembers.forEach(member => {
      if (!this.channel.membersId.some(existingMember => existingMember === member.id)) {
        this.channel.membersId.push(member.id);
      }
    });
    this.selectedMembers = []; 
    await this.channelService.addChannelIdToMembers(this.channel.membersId, this.channel.id);
    await this.channelService.updateMemberIdsToChannel(this.channel.id, this.channel.membersId);
    this.dialogRef.close();
  }


  onNoClick(): void {
    this.dialogRef.close();
  }
  

}
