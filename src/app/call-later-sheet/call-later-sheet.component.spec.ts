import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallLaterSheetComponent } from './call-later-sheet.component';

describe('CallLaterSheetComponent', () => {
  let component: CallLaterSheetComponent;
  let fixture: ComponentFixture<CallLaterSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CallLaterSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CallLaterSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
