import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DarkModeService } from '../../../../services/darkMode/dark-mode.service';

@Component({
  selector: 'app-login-animation-inside',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-animation-inside.component.html',
  styleUrl: './login-animation-inside.component.scss'
})
export class LoginAnimationInsideComponent {
  constructor(public darkmode: DarkModeService) {}

}
