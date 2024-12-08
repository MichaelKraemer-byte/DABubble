import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LightboxService {

  constructor(){}

  public lightboxIsOpen:boolean = false;
  public setAnimationOff:boolean = false;

  openLightBox(){
    if(!this.lightboxIsOpen) this.lightboxIsOpen = true;
  }

  closeLightBox(){
    this.setAnimationOff = true;
    setTimeout(() => {
      if(this.lightboxIsOpen) this.lightboxIsOpen = false;
      this.setAnimationOff = false;
    }, 750)
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
  
}
