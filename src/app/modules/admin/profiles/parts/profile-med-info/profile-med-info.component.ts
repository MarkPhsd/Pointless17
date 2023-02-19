import { Component, OnInit,Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { ClientType, IClientTable } from 'src/app/_interfaces';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'profile-med-info',
  templateUrl: './profile-med-info.component.html',
  styleUrls: ['./profile-med-info.component.scss']
})
export class ProfileMedInfoComponent implements OnInit {

  @Input() inputForm : FormGroup;
  @Input() isAuthorized: boolean;
  @Input() isStaff: boolean;
  @Input() client: IClientTable;

  fileList: string;
  medPatient: boolean;
  clientType$ : Observable<ClientType>;
  site = this.siteService.getAssignedSite()
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
        const clientTypeID = this.inputForm.controls['clientTypeID'].value;
        this.clientType$   = this.clientTypeService.getClientTypeCached(this.site, clientTypeID)
      }
    )

  }

  updateFileList(event) {
    this.fileList = event;
    this.inputForm.patchValue({fileList: this.fileList})
  }

  // isClientType(clientTypeID) {
  //   // if (this.client) {
  //     // this.client = this.inputForm.value;
  //     const site = this.siteService.getAssignedSite()
  //     if (clientTypeID ) {
  //       console.log('Client Type', clientTypeID)

  //     }
  //   // }
  // }

}
