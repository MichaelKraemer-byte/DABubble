import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageOptionsComponent } from './message-options.component';

describe('MessageOptionsComponent', () => {
  let component: MessageOptionsComponent;
  let fixture: ComponentFixture<MessageOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageOptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessageOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
