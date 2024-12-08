import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownSearchbarComponent } from './dropdown-searchbar.component';

describe('DropdownSearchbarComponent', () => {
  let component: DropdownSearchbarComponent;
  let fixture: ComponentFixture<DropdownSearchbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownSearchbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownSearchbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
