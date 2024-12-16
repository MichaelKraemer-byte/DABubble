import { Component, inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule} from '@angular/material/form-field';
import { DevspaceComponent } from '../../main-content/devspace/devspace.component';
import {MatButtonModule} from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ChooseMembersCreateChannelComponent } from './choose-members-create-channel/choose-members-create-channel.component';
import { FormsModule, NgForm } from '@angular/forms';
import { Channel } from '../../../classes/channel.class';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { ChannelService } from '../../../services/channel/channel.service';
import { Member } from '../../../interface/message';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { catchError, filter, firstValueFrom, map, Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-create-channel',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIcon,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule
  ],
  templateUrl: './create-channel.component.html',
  styleUrl: './create-channel.component.scss'
})
export class CreateChannelComponent {
  readonly dialogRef = inject(MatDialogRef<DevspaceComponent>);
  readonly dialog = inject(MatDialog);
  showError: boolean = false;
  @ViewChild('channelForm') channelForm!: NgForm; 

  channel = new Channel();
  currentMember$: Observable<Member | null>;
  channelAlreadyExists: boolean = false;
  
  constructor(
    private authenticationService: AuthenticationService,
    private channelService: ChannelService
  ) {
    this.currentMember$ = this.authenticationService.currentMember$;
  }
  

  async validateChannelBeforeSubmit() {
    const currentMember = await firstValueFrom(this.currentMember$);
    if (currentMember) {
      const accessableChannels = await firstValueFrom(
        this.channelService.getAllAccessableChannelsFromFirestoreObservable(currentMember)
      );  
      const currentChannelTitle = this.channel?.title;
      const channelDoesAlreadyExist = accessableChannels.some((channel) => channel.title.trim() === currentChannelTitle?.trim());
      if (channelDoesAlreadyExist) {
        this.channelAlreadyExists = true;
      } else {
        this.channelAlreadyExists = false;
      }
    } 
  }
  

  onNoClick(): void {
    this.dialogRef.close();
  }


  openChooseMembers() {
    (document.activeElement as HTMLElement)?.blur(); 
    if (window.innerWidth <= 600) {
      const dialogRef = this.dialog.open(ChooseMembersCreateChannelComponent, {
        data: this.channel,
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
      const dialogRef = this.dialog.open(ChooseMembersCreateChannelComponent, {
        data: this.channel,
      });
      dialogRef.afterClosed().subscribe();
    }
    this.dialogRef.close();
  }

  
  async handleButtonClick() {
    this.showError = true;
    await this.validateChannelBeforeSubmit();
    if (this.channelForm.valid && !this.channelAlreadyExists) {
      const buttonElement = document.activeElement as HTMLElement; 
      buttonElement.blur(); 
      this.openChooseMembers();
    } else {
      return;
    }
  }
  
}
