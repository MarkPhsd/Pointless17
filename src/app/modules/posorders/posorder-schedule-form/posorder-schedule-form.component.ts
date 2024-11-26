import { Component, EventEmitter, OnInit,Output,Input,  } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { DayTimeRangeValidator, IPOSOrder, IServiceType, ScheduleValidator, ServiceTypeFeatures } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { Observable, } from 'rxjs';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'app-posorder-schedule-form',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './posorder-schedule-form.component.html',
  styleUrls: ['./posorder-schedule-form.component.scss']
})
export class POSOrderScheduleFormComponent implements OnInit {
  isTimeDisabled: boolean;
  timeSlots: string[] = [];
  @Output() OutPutSaveShippingTime = new EventEmitter();
  @Input() order     : IPOSOrder;
  @Input() inputForm : UntypedFormGroup;
  @Input() scheduleValidator: ScheduleValidator; // Schedule input for day-specific ranges

  props :ServiceTypeFeatures
  scheduledDate       : string;
  serviceType$        : Observable<IServiceType>;
  @Input()  serviceType       : IServiceType;
  appointmentForm: UntypedFormGroup;

  minDate = new Date();
  // Filter function combining minDate and disallowed date logic
  dateFilter = (date: Date | null): boolean => {
    if (!date) return false;

    // Enforce minDate
    if (date < this.minDate) return false;

    // Add more disallowed logic here if necessary
    const day = date.getDay();
    return day !== 0 && day !== 6; // Example: Disable weekends
  };

  constructor(
    private serviceTypeService: ServiceTypeService,
    private sitesService      : SitesService,
    public  platFormService    : PlatformService,
    public  orderMethodsService: OrderMethodsService,
    private dateHelper: DateHelperService,
    private fb: FormBuilder,
   ) { }

  ngOnInit(): void {
    const i = 0
    const now = new Date();
    this.initServiceTypeInfo();
    if (this.serviceType?.json) {
      const props = JSON.parse(this.serviceType.json) as ServiceTypeFeatures;
      this.dateHelper.setDisallowedDates(props.excludedDates, props.weekDayTimeValidator)
      this.dateFilter =   this.dateHelper.generateDisallowedDateFilter();
    }

    const scheduleDate = this.dateHelper.parseFormattedDateTime(this.order?.preferredScheduleDate);
    // console.log('scheduledDate', scheduleDate, this.order?.preferredScheduleDate)
    this.initializeForm(scheduleDate ?? null)
  }

  // Listen for changes to date or time fields and update the unified Date object
  onChanges() {
    this.appointmentForm.get('preferredDate')?.valueChanges.subscribe(() => this.updateScheduleDate());
    this.appointmentForm.get('preferredTime')?.valueChanges.subscribe(() => this.updateScheduleDate());
  }

  // Initialize form with the scheduledDate or default values
  initializeForm(scheduledDate: Date | null) {
    const scheduledTime =     scheduledDate ? this.dateHelper.formatTimeOnly(scheduledDate) : null
    console.log('scheduledTime', scheduledTime)
    this.dateHelper.formatTime
    this.appointmentForm = this.fb.group({
      preferredDate: [scheduledDate ? new Date(scheduledDate) : null], // Initialize with scheduledDate
      preferredTime: [ scheduledTime ],
    });
    if (scheduledDate) {
      this.refreshTimeSlots()
    }
    this.appointmentForm.valueChanges.subscribe(data => this.handleFormChanges(data));
  }

  private handleFormChanges(data: any) {
    console.log('Form data:', data);

    if (!data || !data.preferredDate) {
      this.isTimeDisabled = true; // Disable time field if no date selected
      this.timeSlots = []; // Clear time slots
      return;
    }

    const selectedDate = data.preferredDate;
    this.isTimeDisabled = false; // Enable time field

    // Get the day of the week (e.g., 'Monday')
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Find the schedule for the selected day
    const schedule = this.scheduleValidator;
    const daySchedule = schedule?.week.find(day => day.day === dayName);

    // Generate time slots based on the found schedule or use default
    this.dateHelper.generateTimeSlots(daySchedule?.timeRanges);
    this.timeSlots = this.dateHelper.timeSlots; // Update time slots
  }

  onPreferredDateChange(selectedDate: Date | null) {

    if (!selectedDate) {
      this.isTimeDisabled = true; // Disable time field if no date selected
      this.timeSlots = []; // Clear time slots
      return;
    }

    this.isTimeDisabled = false; // Enable time field
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

    // Find the appropriate schedule for the selected day
    const daySchedule = this.scheduleValidator?.week.find(day => day.day === dayName);

    // Populate time slots or use default if not found
    this.dateHelper.generateTimeSlots(daySchedule?.timeRanges);
    this.timeSlots = this.dateHelper.timeSlots; // Update time slots
  }


  resetAppointment() {
    this.initializeForm(null)

    this.appointmentForm.patchValue({
      preferredDate: null,
      preferredTime: null,
    });

    this.inputForm.patchValue({ preferredScheduleDate: null }); // Clear in inputForm too
  }

  refreshTimeSlots() {

    const scheduledDate = this.appointmentForm.controls['preferredDate'].value;
    if (!scheduledDate ){ return }

    if (scheduledDate) {
      this.populateTimeSlots(scheduledDate);
      this.isTimeDisabled = false; // Enable time field if date is provided
    }
  }

  // Updated populateTimeSlots to use fetchScheduleValidatorForDate
  populateTimeSlots(date: Date) {
    const daySchedule = this.fetchScheduleValidatorForDate(date);
    // Generate time slots using the found or default time ranges
    this.dateHelper.generateTimeSlots(daySchedule.timeRanges);
    this.timeSlots = this.dateHelper.timeSlots;
  }

    // Inside CustomerDateSelectorComponent
    private fetchScheduleValidatorForDate(selectedDate: Date): DayTimeRangeValidator {
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });

      // Check if props or weekDayTimeValidator is null/undefined
      const scheduleValidator: ScheduleValidator | undefined = this.props?.weekDayTimeValidator;

      // If scheduleValidator or its week array is unavailable, return default
      if (!scheduleValidator || !scheduleValidator.week) {
        return {
          day: dayName,
          timeRanges: [{ startTime: '06:00', endTime: '21:00' }],
        };
      }

      // Find the schedule for the selected day
      const daySchedule: DayTimeRangeValidator | undefined = scheduleValidator.week.find(
        (day) => day.day === dayName
      );

      // Return the found schedule or default if not found
      return (
        daySchedule || {
          day: dayName,
          timeRanges: [{ startTime: '06:00', endTime: '21:00' }],
        }
      );
    }


    onSubmit() {
      const selectedDate = this.appointmentForm.get('preferredDate')?.value;
      const selectedTime = this.appointmentForm.get('preferredTime')?.value;

      if (selectedDate && selectedTime) {
        console.log(selectedDate, selectedTime); // Debugging log

        // Extract hours and minutes from the selectedTime string with AM/PM
        const [time, period] = selectedTime.split(' '); // '6:45' and 'AM'
        let [hours, minutes] = time.split(':').map(Number);

        // Convert 12-hour time to 24-hour time
        if (period === 'PM' && hours < 12) hours += 12; // Convert PM hours
        if (period === 'AM' && hours === 12) hours = 0; // Handle midnight (12 AM)

        // Create a new Date object using the selected date and time
        const finalDateTime = new Date(selectedDate);
        finalDateTime.setHours(hours, minutes, 0, 0);

        // Format the final date-time to ISO string
        const dateString = this.dateHelper.formatToISO(finalDateTime);
        console.log('dateString', dateString); // Debugging log

        // Update the order with the preferred schedule date
        this.order.preferredScheduleDate = dateString;
        this.orderMethodsService.updateOrder(this.order);
        this.OutPutSaveShippingTime.emit(dateString);

      } else {
        const message = 'Please select both a date and time.';
        console.warn(message);
        this.sitesService.notify(message, 'close', 5000, 'red');
      }
    }


  // Helper to format minutes with leading zeros (e.g., '01' instead of '1')
  private formatMinutes(minutes: number): string {
    return minutes < 10 ? `0${minutes}` : `${minutes}`;
  }

  // Update the preferredScheduleDate with both the selected date and time
  private updateScheduleDate(): void {
    const selectedDate: Date = this.appointmentForm.get('preferredDate')?.value;
    const timeString: string = this.appointmentForm.get('preferredTime')?.value;

    // if (selectedDate && timeString) {
    //   const [hours, minutes] = timeString.split(':').map(Number);
    //   selectedDate.setHours(hours, minutes, 0, 0); // Update time on the selected date

    //   // Optionally store or use this combined value (e.g., for submission or further processing)
    //   // console.log('Updated Schedule Date:', selectedDate);
    // }

    const validator = this.props?.weekDayTimeValidator
    // this.onDateChange()
  }

  initServiceTypeInfo() {
    const site = this.sitesService.getAssignedSite();
    if (!this.order) {return}
    this.serviceType$ = this.serviceTypeService.getTypeCached(site, this.order?.serviceTypeID)
  }



  requestPrep() {

  }


}
