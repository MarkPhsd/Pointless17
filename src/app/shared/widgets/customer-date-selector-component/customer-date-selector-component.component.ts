import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { ServiceType } from 'src/app/_interfaces/transactions/posorder';
import { IServiceType, ServiceTypeFeatures } from 'src/app/_interfaces';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'customer-date-selector',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './customer-date-selector-component.component.html',
  styleUrls: ['./customer-date-selector-component.component.scss'],
})
export class CustomerDateSelectorComponent implements OnInit {
  appointmentForm: FormGroup;
  allowedDates = [];
  dateFilter: (dateTime: Date | null) => boolean;

  @Input() inputForm: FormGroup;
  @Input() serviceType: IServiceType;
  constructor(private fb: FormBuilder,
              private dateHelper: DateHelperService,
              private serviceTypeService   : ServiceTypeService,) {}

  ngOnInit() {
    // this.allowedDates = this.serviceTypeService.(); // Retrieve allowed dates

    if (this.serviceType?.json) {
      const props = JSON.parse(this.serviceType.json) as ServiceTypeFeatures;
      this.dateHelper.setDisallowedDates(props.excludedDates, props.weekDayTimeValidator)
      this.dateFilter =   this.dateHelper.generateDisallowedDateFilter()
    }

  }

  initializeForm() {
    // this.appointmentForm = this.fb.group({
    //   appointmentDate: [''],
    // });
  }

  // Custom filter to allow only the valid dates and times
  // dateFilter = (dateTime: Date | null): boolean => {
  //   if (!dateTime) return false;

  //   // Use the service's helper or implement logic here to validate the date
  //   return this.dateHelper.isDateTimeDisallowed(dateTime);
  // };

}
