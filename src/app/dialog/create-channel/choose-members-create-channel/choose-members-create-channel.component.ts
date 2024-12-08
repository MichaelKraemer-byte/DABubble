import { Component, Inject, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import {MatRadioModule} from '@angular/material/radio';
import { DevspaceComponent } from '../../../main-content/devspace/devspace.component';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Channel } from '../../../../classes/channel.class';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatOptionModule } from '@angular/material/core';
import {MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, Observable, startWith } from 'rxjs';
import { Member } from '../../../../interface/message';
import { MemberService } from '../../../../services/member/member.service';
import { ChannelService } from '../../../../services/channel/channel.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { MessagesService } from '../../../../services/messages/messages.service';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MainContentService } from '../../../../services/main-content/main-content.service';


@Component({
  selector: 'app-choose-members-create-channel',
  standalone: true,
  imports: [
    MatRadioModule,
    MatIcon,
    MatButtonModule,
    CommonModule,
    FormsModule,
    MatFormField,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatProgressBarModule
  ],
  templateUrl: './choose-members-create-channel.component.html',
  styleUrl: './choose-members-create-channel.component.scss'
})
export class ChooseMembersCreateChannelComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<DevspaceComponent>);
  readonly addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  readonly announcer = inject(LiveAnnouncer);
  selectAllPeople = true; 
  myControl = new FormControl('');
  filteredMembers$: Observable<Member[]> = new Observable<Member[]>(); 
  processCreatingChannel = false;


  channel: Channel;
  members!: Member[];

  selectedMembers: Member[] = [];
  filteredMembers: Member[] = [];


  constructor(@Inject(
    MAT_DIALOG_DATA) public data: Channel, 
    private memberService: MemberService,
    private channelService: ChannelService,
    private authenticationService: AuthenticationService,
    private messageService: MessagesService,
    private mainContentService: MainContentService
  ) {
    this.channel = data; 
  }

  async ngOnInit() {
    this.memberService.getAllMembersFromFirestore((updatedMembers: Member[]) => {
      this.members = updatedMembers.filter(member => member.id !== this.authenticationService.getCurrentUserUid());
    });
    this.filteredMembers$ = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }


  private _filter(value: string): Member[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    return this.members.filter(member => {
      const memberName = member.name ? member.name.toLowerCase() : ''; 
      return memberName.includes(filterValue) &&
      !this.selectedMembers.some(selected => selected.id === member.id);
    });
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
    if (!this.selectedMembers.some(member => member.id === selectedMember.id)) {
      this.selectedMembers.push(selectedMember);
    }
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
  }


  onNoClick(): void {
    this.dialogRef.close();
  };


  async createChannel() {
    this.processCreatingChannel = true;
    if (this.selectAllPeople) {
      this.selectedMembers = [];
      this.channel.isPublic = true;
    } else if (!this.selectAllPeople) {
      this.addSelectedMembers();
      this.channel.isPublic = false;
      this.channel.membersId.push(this.authenticationService.getCurrentUserUid());
      await this.channelService.addChannelIdToMembers(this.channel.membersId, this.channel.id);
    }
    await this.channelService.addChannelToFirebase(this.channel);
    if(!this.selectAllPeople){
      await this.channelService.addChannelIdToCurrentUser(this.channel.id);
    }
    this.channelService.currentChannelId = this.channel.id;
    this.mainContentService.hideThread();
    this.mainContentService.makeChatAsTopLayer();    
    await this.messageService.readChannel();
    this.dialogRef.close();
    this.processCreatingChannel = false;
  }
  

  isFormValid(): boolean {
      if (this.selectAllPeople) {
          return true; 
      } else {
          return this.selectedMembers.length > 0; 
      }
  }
}