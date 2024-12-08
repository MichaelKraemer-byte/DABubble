import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseMembersCreateChannelComponent } from './choose-members-create-channel.component';

describe('ChooseMembersCreateChannelComponent', () => {
  let component: ChooseMembersCreateChannelComponent;
  let fixture: ComponentFixture<ChooseMembersCreateChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseMembersCreateChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseMembersCreateChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
