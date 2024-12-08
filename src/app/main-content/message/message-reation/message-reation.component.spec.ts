import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageReationComponent } from './message-reation.component';

describe('MessageReationComponent', () => {
  let component: MessageReationComponent;
  let fixture: ComponentFixture<MessageReationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageReationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageReationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
