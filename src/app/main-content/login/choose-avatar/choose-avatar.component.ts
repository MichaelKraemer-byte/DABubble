import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SignUpService } from '../../../../services/sign-up/sign-up.service';
import { AuthenticationService } from '../../../../services/authentication/authentication.service';
import { NavigationServiceService } from '../../../../services/NavigationService/navigation-service.service';

@Component({
  selector: 'app-choose-avatar',
  standalone: true,
  imports: [ MatIcon, CommonModule],
  templateUrl: './choose-avatar.component.html',
  styleUrls: ['./choose-avatar.component.scss', 'choose-avatar-profil-picture.scss']
})
export class ChooseAvatarComponent {

  constructor(public signUp: SignUpService, public auth:AuthenticationService, public navigation: NavigationServiceService ){}

  previewUrl: string | ArrayBuffer | null = null;
  defaultImage : string | null = null;
  fileError: string | null = null;
  selectedImage: File | null = null;
  indexNumber:number = 0;
  isSubmit:boolean = false

  async downloadImage(url:string):Promise<Blob>{
    let response = await fetch(url)
    return response.blob();
  }
 
  async selectPicture(filePath:string, index:number){
    let image = await this.downloadImage(filePath);
    image = new File([image], 'profilPicture', { type: image.type });
    this.defaultImage = URL.createObjectURL(image);
    this.selectedImage = image as File;
    this.previewUrl = null;
    this.indexNumber = index;
  }

  checkForFile(file:File):boolean{
    if (!file.type.startsWith('image/')) {
      this.fileError = 'Please only upload Images'
      this.previewUrl = null;
      return false;
    }
    return true;
  }

  checkForSize(file:File):boolean{
    if(file.size > 2 * 1024 * 1024){
      this.fileError = 'Your Uploading-Size is more than 2 MB'
      this.previewUrl = null;
      return false;
    }
    return true;
  }

  onFileSelected(event: Event) {
    let reader = new FileReader();
    let file:File;
    let fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      file = fileInput.files[0];
    if(!this.checkForFile(file)) return;
    if(!this.checkForSize(file)) return;
    this.fileError = null;
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(file);
      this.selectedImage = file;
      this.defaultImage = URL.createObjectURL(file);
      this.indexNumber = 0;
    }
  }

  async onSubmit(){
    this.auth.infoBannerIsSubmit = true;
    this.signUp.image = this.selectedImage as File;
    await this.signUp.signUpUser();
    this.auth.enableInfoBanner('Account is created');
    setTimeout(()=>{
      this.auth.signInUser(this.signUp.userEmail, this.signUp.password, false)
    }, 1750);
  }

  ngOnInit(){
    let picturePool = ['./img/profile-pic/001.svg','./img/profile-pic/002.svg','./img/profile-pic/003.svg','./img/profile-pic/004.svg','./img/profile-pic/005.svg','./img/profile-pic/006.svg']
    let randomNumber = Math.floor(Math.random() * picturePool.length);
    randomNumber = randomNumber <= 0 ? randomNumber = 2 : randomNumber;
    this.selectPicture(picturePool[randomNumber], randomNumber);
  }

}
