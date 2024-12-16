import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicatorForScrollingComponent } from './indicator-for-scrolling.component';

describe('IndicatorForScrollingComponent', () => {
  let component: IndicatorForScrollingComponent;
  let fixture: ComponentFixture<IndicatorForScrollingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndicatorForScrollingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndicatorForScrollingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
