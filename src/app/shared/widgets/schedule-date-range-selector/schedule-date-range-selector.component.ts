import { Component, Input, OnInit, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { DateRangeValidator, ScheduleDateValidator } from 'src/app/_interfaces';

@Component({
  selector: 'app-schedule-date-range-selector',
  templateUrl: './schedule-date-range-selector.component.html',
  styleUrls: ['./schedule-date-range-selector.component.scss']
})
export class ScheduleDateRangeSelectorComponent implements OnInit {

  @Input() initialDateRanges: ScheduleDateValidator;
  @Input() presenationMode: boolean;

  @Output() saveForm = new EventEmitter();
  @ViewChild('dataEntry') dataEntry: TemplateRef<any>;
  @ViewChild('presentation') presentation: TemplateRef<any>;
  
  dateRangeForm: FormGroup;

  get viewOption() {
    if (this.presenationMode) { 
      return this.presentation
    }
    return this.dataEntry;
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit() {

    if (this.presenationMode) { return }
    if (!this.initialDateRanges || !this.initialDateRanges.allowedDates) {
      this.initialDateRanges = this.getDefaultDateRanges();
    }

    this.initializeForm(this.initialDateRanges);
  }

  initializeForm(dateRanges: ScheduleDateValidator) {
    this.dateRangeForm = this.fb.group({
      allowedDates: this.fb.array(
        (dateRanges.allowedDates || []).map(range => this.createDateRangeControl(range))
      )
    });
  }

  createDateRangeControl(range: DateRangeValidator): FormGroup {
    return this.fb.group({
      startDate: [range.startDate],
      endDate: [range.endDate]
    });
  }

  get dateRanges(): FormArray {
    return this.dateRangeForm.get('allowedDates') as FormArray;
  }

  addDateRange() {
    this.dateRanges.push(this.createDateRangeControl({ startDate: '', endDate: '' }));
  }

  saveDateRanges() {
    const savedDateRanges = this.dateRangeForm.value.allowedDates.map(range => ({
      startDate: this.formatDateToString(range.startDate),
      endDate: this.formatDateToString(range.endDate)
    }));

    const wrappedDateRanges = {
      allowedDates: savedDateRanges
    };

    console.log('Wrapped Date Ranges:', wrappedDateRanges);
    this.saveForm.emit(wrappedDateRanges);
  }

  formatDateToString(date: any): string {
    if (!date) {
      return '';
    }
  
    const parsedDate = new Date(date);
  
    // Adjust for timezone offset to prevent shifting the date
    const localDate = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000);
  
    return localDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
  }
  

  loadDateRanges(dateRanges: ScheduleDateValidator) {
    this.initializeForm(dateRanges);
  }

  getDefaultDateRanges(): ScheduleDateValidator {
    return {
      allowedDates: [{ startDate: '', endDate: '' }]
    };
  }
}
