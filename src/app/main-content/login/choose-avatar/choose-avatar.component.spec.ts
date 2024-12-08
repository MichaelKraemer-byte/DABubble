import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseAvatarComponent } from './choose-avatar.component';

describe('ChooseAvatarComponent', () => {
  let component: ChooseAvatarComponent;
  let fixture: ComponentFixture<ChooseAvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseAvatarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseAvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
