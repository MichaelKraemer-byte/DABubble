// import { CanActivateFn } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   return true;
// };

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication/authentication.service';
import { ChannelService } from '../services/channel/channel.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthenticationService,
    private channelService: ChannelService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
    const channelId = route.paramMap.get('channelId');
    const userId = this.authService.getCurrentUserId();

    // // Prüfen, ob der Benutzer eingeloggt ist
    // if (!userId) {
    //   this.router.navigate(['/login']);
    //   return false;
    // }

    // // Zusätzliche Prüfung: Nur Zugriff auf den Channel, wenn der Benutzer berechtigt ist
    // const hasAccess = await this.channelService.hasAccessToChannel(userId, channelId);

    // if (!hasAccess) {
    //   this.router.navigate(['/start/channels']);
    //   return false;
    // }

    return true;
  }
}