import { Component, ElementRef, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { Member } from '../../../interface/message';
import { StorageService } from '../../../services/storage/storage.service';
import { MemberService } from '../../../services/member/member.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIcon,
    FormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  readonly dialogRef = inject(MatDialogRef<ProfileComponent>);
  editDialog: boolean = false;
  previousMember: Member = {} as Member;
  currentMember: Member = {} as Member; 
  downloadURL?: File;
  currentMember$;

  constructor(
    public authenticationService: AuthenticationService,
    private memberService: MemberService,
    private storageService: StorageService
  ){
    this.previousMember = this.currentMember;
    this.currentMember$ = this.authenticationService.currentMember$;
  }

  async ngOnInit() {
    await this.memberService.setCurrentMemberData();
    this.currentMember = this.authenticationService.currentMember || {} as Member;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async save(currentMember: Member) {
    if (this.currentMember === this.previousMember) {
        this.editDialog = false;
        return;
    }
    this.currentMember = currentMember;
    await Promise.all([
        this.memberService.updateCurrentMemberData(this.currentMember),
        this.authenticationService.updateAuthProfileData(this.currentMember)
    ]);
    if (this.downloadURL) {
        try {
            const uploadedUrl = await this.storageService.uploadImage(this.downloadURL);
            await this.memberService.updateProfileImageOfUser(uploadedUrl);
            this.currentMember.imageUrl = uploadedUrl;
        } catch (error) {
            console.error('Error while uploading new profile image:', error);
        }
    }
    this.editDialog = false;
}



  openFileDialog() {
    this.fileInput.nativeElement.click(); 
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.downloadURL = file;
      const previewUrl = URL.createObjectURL(file);
      this.currentMember.imageUrl = previewUrl;
    }
  }}
