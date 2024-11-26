import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';


@Component({
  selector: 'app-ebay-aspects',

  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './ebay-aspects.component.html',
  styleUrls: ['./ebay-aspects.component.scss']
})
export class EbayAspectsComponent implements OnInit, OnChanges {
  @Input() aspectForm: FormGroup;
  @Input() aspectData: any;
  formVisible: boolean ;
  @Input() useAllOptions: boolean;
  @Output() outPutAspects = new EventEmitter<any>();
  @Input() aspectSelected: any;
  constructor(private fb: FormBuilder, private siteservice: SitesService) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges() {
    this.initializeForm()
  }

  clearSelectedValues() {
    this.aspectSelected = null;
    this.outPutAspects.emit(null);
    this.initializeForm()
  }

  get aspectsControls(): FormArray {
    return this.aspectForm.get('aspects') as FormArray;
  }

  initializeForm() {

    this.aspectForm = this.fb.group({
      aspects: this.fb.array([], Validators.required)
    });

    const aspectArray = this.aspectForm.get('aspects') as FormArray;
    if (this.aspectSelected)  {
      const aspects = this.aspectSelected
      for (const [key, value] of Object.entries(aspects)) {
        const aspectGroup = this.createAspectGroupFromSaved({
          localizedAspectName: key,
          selectedValue: value[0], // Assuming each aspect has a single value
          aspectValues: value //? aspects.aspectValues.map(v => v.localizedValue) : []
        });
        // console.log(key, value[0], aspectGroup)
        aspectArray.push(aspectGroup);
      }
    } else {

    }

    let aspects = this.aspectData?.aspects;
    try {
      aspects.forEach(aspect => {
        if (aspect.aspectConstraint.aspectRequired || this.useAllOptions ) {
          aspectArray.push(this.createAspectGroup(aspect));
        }
      });
    } catch (error) {

    }

  }

  _initializeForm() {

    // console.log(this.aspectSelected)

    this.aspectForm = this.fb.group({
      aspects: this.fb.array([], Validators.required)
    });
    const aspectArray = this.aspectForm.get('aspects') as FormArray;

    let aspects = this.aspectData?.aspects;
    if (!this.aspectData) {
      aspects = this.aspectSelected
    }

    if (!aspects) {
      return;
    }

    try {
      aspects.forEach(aspect => {
        if (aspect.aspectConstraint.aspectRequired || this.useAllOptions ) {
          aspectArray.push(this.createAspectGroup(aspect));
        }
      });
    } catch (error) {

    }

    if (this.aspectSelected) {
      this.aspectForm.patchValue(this.aspectSelected)
    }
  }

  toggleAllOptions() {
    this.useAllOptions = !this.useAllOptions
    this.initializeForm()
  }

  saveData() {
    localStorage.setItem('aspectData', JSON.stringify(this.aspectData))
  }

  loadData() {
    this.aspectData = JSON.parse(localStorage.getItem('aspectData'))
    // console.log('aspect', this.aspectData)
    this.initializeForm()
  }

  // createAspectGroup(aspect): FormGroup {
  //   return this.fb.group({
  //     localizedAspectName: [aspect.localizedAspectName],
  //     selectedValue: ['', Validators.required], // For the selected or entered value
  //     aspectValues: this.fb.array(aspect.aspectValues.map(val => this.fb.control(val.localizedValue)))
  //   });
  // }

  createAspectGroup(aspect): FormGroup {
    return this.fb.group({
      localizedAspectName: [aspect.localizedAspectName],
      selectedValue: [aspect.selectedValue || ''], // Set the selected value if available
      aspectValues: this.fb.array(aspect.aspectValues.map(val => this.fb.control(val.localizedValue || '')))
    });
  }

  createAspectGroupFromSaved(aspect): FormGroup {
    return this.fb.group({
      localizedAspectName: [aspect.localizedAspectName],
      selectedValue: [aspect.selectedValue || ''], // Set the selected value if available
      aspectValues: [aspect.aspectValues || ''],
    });
  }
  transformFormToAspectsObject(): any {
    const formValue = this.aspectForm.value;
    let aspectsObject = {};

    formValue.aspects.forEach(aspect => {
      // Using the localizedAspectName as the key and the selectedValue in an array
      aspectsObject[aspect.localizedAspectName] = [aspect.selectedValue];
    });

    return aspectsObject;
  }

  onSubmit() {
    const aspectsObject = this.transformFormToAspectsObject();
    // console.log(aspectsObject);
    this.outPutAspects.emit(aspectsObject)

  }

}
