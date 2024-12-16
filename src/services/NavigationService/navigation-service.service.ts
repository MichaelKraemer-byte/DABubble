import { Injectable, ViewChild, ElementRef } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavigationServiceService {

  constructor() { }
  @ViewChild('whiteBoxElement') whiteBoxElement!: ElementRef;

  isScrollable = false;
  isScrollableTrahshold = 20;
  currentNavIndex:number = 0;
  lastIndex:number = 0;
  nextIndex:number = 0;
  isUntouched:boolean = true;
  fadeRightIndex:number = 0; 
  fadeLeftIndex:number = 0;
  movingForwards:boolean = true;
 

  /*            0            1                 2                3      */
  PageMap = ['Login', 'Create Accoutn', 'Choose Profil', 'Lost Password']

  getCurrentIndex(){
    return this.currentNavIndex;
  }

  navToPage(hierarchieIndex:number = 0){
    this.isUntouched = false;
    this.lastIndex = this.currentNavIndex; 
    this.nextIndex = hierarchieIndex;

    if(hierarchieIndex > this.currentNavIndex){
      this.fadeLeftIndex = hierarchieIndex;
      this.fadeRightIndex = this.lastIndex; 
      this.movingForwards = true;
    } else if(hierarchieIndex < this.currentNavIndex && this.currentNavIndex > 0){
      this.fadeLeftIndex = this.lastIndex;
      this.fadeRightIndex = hierarchieIndex; 
      this.movingForwards = false;
    }

    this.currentNavIndex = hierarchieIndex;
  }

  reset(){
    this.currentNavIndex = 0;
    this.lastIndex = 0;
    this.nextIndex = 0;
    this.isUntouched = true;
    this.fadeRightIndex= 0; 
    this.fadeLeftIndex = 0;
    this.movingForwards = true;
  }

  checkScrollStatus(){
    this.isScrollable = false;
    const whiteBox = document.getElementById('whiteBox');
    setTimeout(() => {
      this.isScrollable = whiteBox!.scrollHeight - this.isScrollableTrahshold > whiteBox!.clientHeight;
    },250);
   }
}
