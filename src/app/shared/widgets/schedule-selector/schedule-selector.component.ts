import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IServiceType, ScheduleValidator, DayTimeRangeValidator } from 'src/app/_interfaces/raw/serviceTypes';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { AppMaterialModule } from 'src/app/app-material.module';

@Component({
  selector: 'app-schedule-selector',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './schedule-selector.component.html',
  styleUrls: ['./schedule-selector.component.scss']
})
export class ScheduleSelectorComponent implements OnInit {

  allDaysOfWeek: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


  @Input() initialSchedule: ScheduleValidator;  // Input to accept initial data
  @Input() serviceType: IServiceType;
  @Input() presenationMode: boolean;

  @Output() saveForm = new EventEmitter();
  @ViewChild('dataEntry') dataEntry: TemplateRef<any>;
  @ViewChild('presentation') presentation: TemplateRef<any>;
  scheduleForm: FormGroup;

  get viewOption() {
    if (this.presenationMode) {
      return this.presentation
    }
    return this.dataEntry;
  }

  constructor(
    public dateHelper: DateHelperService,
    private fb: FormBuilder) { }

  ngOnInit() {
    this.initializeForm(this.initialSchedule || this.getDefaultSchedule());
  }

  initializeForm(schedule: ScheduleValidator) {
    if (!schedule || !schedule.week) {
      schedule = this.getDefaultSchedule();  // Fall back to default if needed
    }

    this.scheduleForm = this.fb.group({
      week: this.fb.array(schedule.week.map(day => this.createDayControl(day)))
    });
  }

  createDayControl(dayTimeRange: DayTimeRangeValidator): FormGroup {
    return this.fb.group({
      disabled: [dayTimeRange?.disabled],  // Default to false if disabled is null or undefined
      day: [dayTimeRange.day],
      timeRanges: this.fb.array(dayTimeRange.timeRanges.map(range => this.createTimeRangeControl(range)) || [])
    });
  }

  createTimeRangeControl(range: { startTime: string, endTime: string }): FormGroup {
    return this.fb.group({
      startTime: [range.startTime],
      endTime: [range.endTime]
    });
  }


  get timeRanges(): FormArray {
    return this.scheduleForm.get('week') as FormArray;
  }

  addTimeRange(dayIndex: number) {
    const dayGroup = this.timeRanges.at(dayIndex) as FormGroup;
    if (dayGroup && dayGroup.get('timeRanges')) {
      const ranges = dayGroup.get('timeRanges') as FormArray;
      ranges.push(this.createTimeRangeControl({ startTime: '', endTime: '' }));
    }
  }


  saveSchedule() {
    const savedSchedule = this.scheduleForm.value;
    console.log('Saved Schedule:', savedSchedule);
    this.saveForm.emit(savedSchedule);
  }


  loadSchedule(schedule: ScheduleValidator) {
    this.initializeForm(schedule);
  }

  getDefaultSchedule(): ScheduleValidator {
    const defaultSchedule: ScheduleValidator = {
      week: [
        { day: 'Monday', timeRanges: [] },
        { day: 'Tuesday', timeRanges: [] },
        { day: 'Wednesday', timeRanges: [] },
        { day: 'Thursday', timeRanges: [] },
        { day: 'Friday', timeRanges: [] },
        { day: 'Saturday', timeRanges: [] },
        { day: 'Sunday', timeRanges: []  }
      ]
    };
    return defaultSchedule;
  }


  // Assuming scheduleForm holds the form data with week and time ranges
  isDayDisabled(day: string): boolean {
    const dayData = this.scheduleForm?.get('week')?.value?.find(d => d.day === day);
    return dayData ? dayData.disabled : false;
  }

  hasTimeRangesForDay(day: string): boolean {
    const dayData = this.scheduleForm?.get('week')?.value?.find(d => d.day === day);
    return dayData && dayData.timeRanges && dayData.timeRanges.length > 0;
  }

  getTimeRangesForDay(day: string): any[] {
    const dayData = this.scheduleForm?.get('week')?.value?.find(d => d.day === day);
    return dayData ? dayData.timeRanges : [];
  }

}

