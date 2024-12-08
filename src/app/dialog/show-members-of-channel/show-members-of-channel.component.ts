import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ChatHeaderComponent } from '../../main-content/chat/chat-header/chat-header.component';
import { MemberService } from '../../../services/member/member.service';
import { ChannelService } from '../../../services/channel/channel.service';
import { Channel } from '../../../classes/channel.class';
import { Member } from '../../../interface/message';
import { map, Observable, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AddMembersChannelComponent } from '../add-members-channel/add-members-channel.component';

@Component({
  selector: 'app-show-members-of-channel',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormField,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './show-members-of-channel.component.html',
  styleUrl: './show-members-of-channel.component.scss'
})
export class ShowMembersOfChannelComponent {
  readonly dialogRef = inject(MatDialogRef<ChatHeaderComponent>);
  readonly dialog = inject(MatDialog);
  readonly addOnBlur = true;
  myControl = new FormControl('');
  filteredMembers$: Observable<Member[]> = new Observable<Member[]>(); 


  channel!: Channel;
  members: Member[] = [];

  constructor(
    public memberService: MemberService,
    private channelService: ChannelService,
  ) {
  }

  async ngOnInit() {
    const fetchedChannel = await this.channelService.getChannelById(this.channelService.currentChannelId);
    if (fetchedChannel) {
      this.channel = fetchedChannel;
    }
    this.members = await this.memberService.allMembersInChannel();    
    this.filteredMembers$ = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }
  

  private _filter(value: string): Member[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : '';
    
    return this.members.filter(member => 
      member.name.toLowerCase().includes(filterValue)
    );
  }
  
  openAddMembersToChannelDialog(): void {
    this.dialogRef.close();
    if (window.innerWidth <= 450) {
      const dialogRef = this.dialog.open(AddMembersChannelComponent, {
        width: '280px',
        height: 'auto',
        position: { top: '300px', right: '16px'},
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
}
