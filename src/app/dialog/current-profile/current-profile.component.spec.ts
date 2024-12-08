import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentProfileComponent } from './current-profile.component';

describe('CurrentProfileComponent', () => {
  let component: CurrentProfileComponent;
  let fixture: ComponentFixture<CurrentProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
