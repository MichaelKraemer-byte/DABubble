import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMembersChannelComponent } from './add-members-channel.component';

describe('AddMembersChannelComponent', () => {
  let component: AddMembersChannelComponent;
  let fixture: ComponentFixture<AddMembersChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddMembersChannelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddMembersChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
