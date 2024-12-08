import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { StorageService } from '../../../../../services/storage/storage.service';

@Component({
  selector: 'app-thread-images-preview',
  standalone: true,
  imports: [
    CommonModule,
    MatIcon
  ],
  templateUrl: './thread-images-preview.component.html',
  styleUrl: './thread-images-preview.component.scss'
})
export class ThreadImagesPreviewComponent {

  constructor(
    public storageService: StorageService
  ) {}
  
  deleteImage(attachment: any,i: any) {
    this.storageService.messageImages.splice(i, 1)
    this.storageService.deleteMessageImages(attachment)
  }
}
