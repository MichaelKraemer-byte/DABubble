import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmenuLoginComponent } from './submenu-login.component';

describe('SubmenuLoginComponent', () => {
  let component: SubmenuLoginComponent;
  let fixture: ComponentFixture<SubmenuLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmenuLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmenuLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
