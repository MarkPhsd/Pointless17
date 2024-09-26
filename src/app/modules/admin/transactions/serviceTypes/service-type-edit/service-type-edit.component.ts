
import { Component,  Inject, OnInit } from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormArray, FormBuilder, FormGroup, UntypedFormGroup, Validators } from '@angular/forms';
import { IServiceType, IServiceTypePOSPut } from 'src/app/_interfaces';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { FbServiceTypeService } from 'src/app/_form-builder/fb-service-type.service';
import { catchError, of, switchMap, Observable } from 'rxjs';

@Component({
  selector: 'app-service-type-edit',
  templateUrl: './service-type-edit.component.html',
  styleUrls: ['./service-type-edit.component.scss']
})
export class ServiceTypeEditComponent implements OnInit {

  serviceColor          : string;
  id                     : number;
  serviceType            : IServiceType;
  bucketName             : string;
  awsBucketURL           : string;
  inputForm              : UntypedFormGroup;
  description            : string;
  action$                : Observable<any>;
  serviceTypeFeaturesForm : FormGroup;
  image: string;

  constructor(
    private serviceTypeService      : ServiceTypeService,
    private siteService             : SitesService,
    private snack                   : MatSnackBar,
    private fbServiceTypeService    : FbServiceTypeService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ServiceTypeEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)

  {
    this.id = 0
    if (data) {
      this.id = data
    }
    if (!data || data == 0) {
      this.id = 0
    }
  }

    ngOnInit() {
      this.initializeForm();
      // this.bucketName =       await this.awsBucket.awsBucket();
      // this.awsBucketURL =     await this.awsBucket.awsBucketURL();
    };

    initializeForm()  {

      this.initFormFields()
      const site = this.siteService.getAssignedSite();
      let service$ : Observable<unknown>;

      if (this.id == 0) {
        // console.log('this id =0')
        const service = {} as IServiceTypePOSPut;
        service$  = this.serviceTypeService.postServiceType(site, service)

      }

      if (this.id != 0) {
        // console.log('this id !0')
        service$  = this.serviceTypeService.getType(site, this.id)  //as Observable<IServiceType>;
      }

      this.action$ = service$.pipe(switchMap(data => {
            this.serviceType = {} as IServiceType;
            if (data) {
              this.serviceType = data as unknown as IServiceType;
              this.id          = this.serviceType.id;
              this.serviceColor = this.serviceType.serviceColor
              this.image = this.serviceType?.image;
            }
            this.inputForm.patchValue(this.serviceType)
            this.patchFormValues()
            return of(data)
          }
        )),catchError( error => {
          this.snack.open(`Issue. ${error}`, "Failure", {duration:2000, verticalPosition: 'top'})
          return of(error)
        })

      // }

    };

    applyImage(event)  {

        this.image = event
        this.serviceType.image = event
        this.inputForm.patchValue({image: event})

    }

    patchFormValues() {
      this.serviceTypeFeaturesForm = this.initFeaturesForm();
      if (!this.serviceType.json) { return }
      const itemFeatures = JSON.parse(this.serviceType.json);

      this.serviceTypeFeaturesForm.patchValue({
        weekDays: itemFeatures.weekDays,
        hoursAndDayID: itemFeatures.hoursAndDayID,
        seatEnabled: itemFeatures.seatEnabled,
        icon: itemFeatures.icon
      });

      // Patch nameStringPairs
      const nameStringPairsArray = this.serviceTypeFeaturesForm.get('nameStringPairs') as FormArray;
      itemFeatures.nameStringPairs.forEach((pair: any) => {
        const nameStringGroup = this.fb.group({
          name: [pair.name, Validators.required],
          values: this.fb.array(pair.values.map((value: string) => this.fb.control(value)))
        });
        nameStringPairsArray.push(nameStringGroup);
      });

      // Patch addressList
      const addressListArray = this.addressList;
      itemFeatures.addressList.forEach((address: any) => {
        addressListArray.push(this.fb.group({
          name: [address.name],
          contactName: [address.contactName],
          phone: [address.phone],
          address: [address.address],
          unit: [address.unit],
          city: [address.city],
          state: [address.state],
          zip: [address.zip]
        }));
      });
    }


    initFormFields() {
      this.inputForm  = this.fbServiceTypeService.initForm(this.inputForm)
    }

    updateItem(event: any)  {

      if (!this.inputForm.valid) { return }
      const site = this.siteService.getAssignedSite()
      let serviceType = this.inputForm.value ;
      if (this.serviceType) {
        serviceType.serviceColor = this.serviceColor;
      }

      const featuresValue = this.serviceTypeFeaturesForm.value;
      const json = JSON.stringify(featuresValue);
      serviceType.json = json;

      const item$ = this.serviceTypeService.saveServiceType(site, serviceType)
      if (serviceType.retailServiceType) {
        serviceType.retailServiceType = 1;
      } else {
        serviceType.retailServiceType = 0
      }

      this.action$ = item$.pipe(
        switchMap(
         data => {
            this.serviceType = data;
            this.inputForm.patchValue(this.serviceType)
            this.snack.open('Item Updated', 'Success', {duration:2000, verticalPosition: 'top'})
            if (event) { this.onCancel(event) }
            return of(data)
          }
        ), catchError(
          error => {
            this.snack.open(`Update failed. ${error}`, "Failure", {duration:2000, verticalPosition: 'top'})
            return of(error)
          }
        ))

    };

    updateItemExit(event) {
      this.updateItem(true)
    }

    onCancel(event) {
      this.dialogRef.close();
    }

    deleteDefaultProductID1() {
      this.inputForm.patchValue({defaultProductID1: 0})
      this.updateItem(null)
    }

    deleteDefaultProductID2() {
      this.inputForm.patchValue({defaultProductID2: 0})
      this.updateItem(null)
    }

    _deleteDefaultProductID1(event)  {
      this.inputForm.patchValue({defaultProductID1: 0})
      this.updateItem(null)
    }
    _deleteDefaultProductID2(event)  {
      this.inputForm.patchValue({defaultProductID2: 0})
      this.updateItem(null)
    }
    deleteItem(event) {

      const site = this.siteService.getAssignedSite()
      if (!this.serviceType) {
        this.snack.open("No item initiated.", "Failure", {duration:2000, verticalPosition: 'top'})
        return
      }
        this.serviceTypeService.delete(site, this.serviceType.id).subscribe( data =>{
          this.snack.open("Item deleted", "Success", {duration:2000, verticalPosition: 'top'})
          this.onCancel(event)
      })
    }

    copyItem(event) {
      //do confirm of delete some how.
      //then
    }

    initFeaturesForm() {
      return this.fb.group({
        weekDays: [[]],
        hoursAndDayID: [[]],
        seatEnabled: [false],
        icon: [''],
        nameStringPairs: this.fb.array([]),
        addressList: this.fb.array([])  // Treat addressList as FormArray for multiple addresses
      });
    }
    initAddress(): FormGroup {
      return this.fb.group({
        name: [''],
        contactName: [''],
        phone: [''],
        address: [''],
        unit: [''],
        city: [''],
        state: [''],
        zip: ['']
      });
    }
    // Helper to get the form array
    get nameStringPairs(): FormArray {
      return this.serviceTypeFeaturesForm.get('nameStringPairs') as FormArray;
    }

    // Add a new name-string pair to the form
    addNameStringPair() {
      try {
        const nameStringGroup = this.fb.group({
          name: ['', Validators.required],
          values: this.fb.array([this.fb.control('')])  // Initialize with one empty string
        });
        this.nameStringPairs.push(nameStringGroup);
      } catch (error) {
        console.log(error)
      }
    }

    // Remove a name-string pair from the form
    removeNameStringPair(index: number) {
      try {
        this.nameStringPairs.removeAt(index);
      } catch (error) {
        console.log(error)
      }
    }

    // Add a value to the values list of a specific name
    addValueToPair(index: number) {
      try {
        const values = this.nameStringPairs.at(index).get('values') as FormArray;
        values.push(this.fb.control(''));
      } catch (error) {
        console.log(error)
      }
    }

    // Remove a value from the values list of a specific name
    removeValueFromPair(pairIndex: number, valueIndex: number) {
      try {
        const values = this.nameStringPairs.at(pairIndex).get('values') as FormArray;
        values.removeAt(valueIndex);
      } catch (error) {
        console.log(error)
      }
    }

    // Helper to get the form array
    get addressList(): FormArray {
      return this.serviceTypeFeaturesForm.get('addressList') as FormArray;
    }

    // Add a new address to the addressList
    addAddress() {
      this.addressList.push(this.initAddress());
    }

    // Remove an address from the addressList
    removeAddress(index: number) {
      this.addressList.removeAt(index);
    }


  }
