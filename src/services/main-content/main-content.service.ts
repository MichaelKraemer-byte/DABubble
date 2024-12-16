import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Channel } from '../../classes/channel.class';
import { Member } from '../../interface/message';
import { Router } from '@angular/router';
import { MessagesService } from '../messages/messages.service';

@Injectable({
  providedIn: 'root'
})
export class MainContentService {

    // Use BehaviorSubject for each layer toggle to hold the current state and allow subscriptions
    private navBarIsClosedSubject = new BehaviorSubject<boolean>(true);

    public devSpaceAsTopLayer$ = new BehaviorSubject<boolean>(true);
    private chatAsTopLayer$ = new BehaviorSubject<boolean>(false);
    private threadAsTopLayer$ = new BehaviorSubject<boolean>(false);
    private threadIsOpen$ = new BehaviorSubject<boolean>(false);
  
    // Expose Observables for components to subscribe
    navBarIsClosed$: Observable<boolean> = this.navBarIsClosedSubject.asObservable();

    devSpaceAsTopLayerObs = this.devSpaceAsTopLayer$.asObservable();
    chatAsTopLayerObs = this.chatAsTopLayer$.asObservable();
    threadAsTopLayerObs = this.threadAsTopLayer$.asObservable();
    threadIsOpen = this.threadIsOpen$.asObservable();


  constructor(
    private router: Router,
    private injector: Injector // Verwende Injector anstelle direkter Abhängigkeit
  ) {
  }

  reloadCurrentRoute() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }

  toggleNavBar() {
    const currentState = this.navBarIsClosedSubject.value; // aktuellen Zustand abrufen
    this.navBarIsClosedSubject.next(!currentState);
  }


  closeNavBar() {
    this.navBarIsClosedSubject.next(false);
    // this.devSpaceAsTopLayer$.next(false);
  }

  closeNavBarForTabletOrMobile() {
    if (window.innerWidth < 900) {
      this.navBarIsClosedSubject.next(false);
    } else {
      return
    }
  }

  openNavBar() {
    if (window.innerWidth <= 450) {
      this.navBarIsClosedSubject.next(true);
    }
  }

  openChannelForMobile(){
    this.makeChatAsTopLayer();
  }

  openThreadForMobile(){
    this.makeThreadAsTopLayer();
  }

  backToDevSpace(){
    const messageService = this.injector.get(MessagesService); // Dynamisch auflösen
    messageService.searchQuery = ''; // Variable zurücksetzen
    this.makeDevSpaceAsTopLayer();
  }

  // Methods to update each layer’s state
  makeDevSpaceAsTopLayer() {
    this.devSpaceAsTopLayer$.next(true);
    this.chatAsTopLayer$.next(false);
    this.threadAsTopLayer$.next(false);
  }

  makeChatAsTopLayer() {
    this.threadAsTopLayer$.next(false);
    this.devSpaceAsTopLayer$.next(false);
    this.chatAsTopLayer$.next(true);
  }

  makeThreadAsTopLayer() {
    this.devSpaceAsTopLayer$.next(false);
    this.chatAsTopLayer$.next(false);
    this.threadAsTopLayer$.next(true);
  }

  displayThread(){
    this.threadIsOpen$.next(true);
  }

  hideThread(){
    this.threadIsOpen$.next(false);
  }

  // Hilfsfunktion für die Überprüfung, ob das Objekt ein Member ist
  isMember(obj: any): obj is Member {
    return obj && typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.email === 'string';
  }
  
  // Hilfsfunktion für die Überprüfung, ob das Objekt ein Channel ist
  isChannel(obj: any): obj is Channel {
    return obj && typeof obj.id === 'string' && typeof obj.title === 'string';
  }

  locationReload(){
    location.reload();
  }

}
