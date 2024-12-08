import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginAnimationInsideComponent } from './login-animation-inside.component';

describe('LoginAnimationInsideComponent', () => {
  let component: LoginAnimationInsideComponent;
  let fixture: ComponentFixture<LoginAnimationInsideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginAnimationInsideComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginAnimationInsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
