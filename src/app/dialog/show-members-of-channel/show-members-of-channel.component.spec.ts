import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMembersOfChannelComponent } from './show-members-of-channel.component';

describe('ShowMembersOfChannelComponent', () => {
  let component: ShowMembersOfChannelComponent;
  let fixture: ComponentFixture<ShowMembersOfChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowMembersOfChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowMembersOfChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
