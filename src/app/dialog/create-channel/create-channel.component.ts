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
  
  onNoClick(): void {
    this.dialogRef.close();
  }

  openChooseMembers() {
    (document.activeElement as HTMLElement)?.blur();  // Fokus aufheben
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

  handleButtonClick() {
    this.showError = true;
    
    if (this.channelForm.valid) {
        this.openChooseMembers();
    }
  }
}
