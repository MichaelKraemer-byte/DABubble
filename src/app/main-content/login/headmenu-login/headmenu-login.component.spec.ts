import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeadmenuLoginComponent } from './headmenu-login.component';

describe('HeadmenuLoginComponent', () => {
  let component: HeadmenuLoginComponent;
  let fixture: ComponentFixture<HeadmenuLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeadmenuLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeadmenuLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
