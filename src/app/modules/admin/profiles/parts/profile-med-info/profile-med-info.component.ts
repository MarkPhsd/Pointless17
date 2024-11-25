import { Component, OnInit,Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { ClientType, IClientTable } from 'src/app/_interfaces';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ValueFieldsComponent } from '../../../products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { UploaderComponent } from 'src/app/shared/widgets/AmazonServices';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'profile-med-info',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    ValueFieldsComponent,UploaderComponent
  ],
  templateUrl: './profile-med-info.component.html',
  styleUrls: ['./profile-med-info.component.scss']
})
export class ProfileMedInfoComponent implements OnInit {

  @Input() inputForm : UntypedFormGroup;
  @Input() isAuthorized: boolean;
  @Input() isStaff: boolean;
  @Input() client: IClientTable;

  fileList: string;
  medPatient: boolean;
  clientType$ : Observable<ClientType>;
  site = this.siteService.getAssignedSite()
  clientType: ClientType;

  constructor(
    private siteService: SitesService,
    private clientTypeService: ClientTypeService) { }

  ngOnInit(): void {
    const i = 0

    this.inputForm.valueChanges.subscribe( data => {
        const status = this.inputForm.controls['patientRecOption'].value;
        this.medPatient = false;
        if (status) {
          this.medPatient = true;
        }
      }
    )

    if (this.inputForm) {
      this.inputForm.controls['clientTypeID'].valueChanges.subscribe(data => {
        console.log('clientTypeID  changes', data)
        const clientTypeID = data// this.inputForm.controls['clientTypeID'].value;
        if (clientTypeID) {
          this.clientType$   = this.clientTypeService.getClientTypeCached(this.site, clientTypeID).pipe(switchMap(data => {
            this.clientType = data;
            this.setMedType(this.inputForm, this.clientType)
            return of(data)
          }))
        }
      })
    }


  }

  setMedType(form: UntypedFormGroup, clientType: ClientType) {
    if (clientType &&  form && clientType.name && (clientType.name.toLowerCase() === 'patient' ||
                                                   clientType.name.toLowerCase() === 'caregiver' )) {
      form.patchValue({patientRecOption: true})
      console.log('set patient rect option true')
      return
    }

    form.patchValue({patientRecOption: false})
  }

  get isMedPatient() {
    if (this.inputForm) {
      if (this.inputForm.controls['patientRecOption'].value) {
        return true
      }
    }
    return false
  }

  updateFileList(event) {
    this.fileList = event;
    this.inputForm.patchValue({fileList: this.fileList})
  }


}
