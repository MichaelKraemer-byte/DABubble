import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { LightboxService } from '../../../services/lightbox/lightbox.service';
import { PrivacyPolicyComponent } from '../../imprint/privacy-policy/privacy-policy.component';

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [MatIcon, PrivacyPolicyComponent],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.scss'
})
export class LightboxComponent {
  constructor(public lightbox: LightboxService){}
}
