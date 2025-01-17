import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FbCompanyService } from 'src/app/_form-builder/fb-company.service';
import { FbContactsService } from 'src/app/_form-builder/fb-contacts.service';
import { ICompany } from 'src/app/_interfaces';
import { AWSBucketService, CompanyService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { UploaderComponent } from 'src/app/shared/widgets/AmazonServices';
import { ValueFieldsComponent } from '../products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'company-edit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    UploaderComponent,ValueFieldsComponent,EditButtonsStandardComponent,
  SharedPipesModule],
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.scss']
})
export class CompanyEditComponent implements OnInit {

  inputForm   : UntypedFormGroup;
  bucketName  :  string;
  awsBucketURL:  string;

  company: ICompany;
  company$: Observable<ICompany>;

  //for swipping
  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };

  public selectedIndex: number;
  isAuthorized  : boolean ;
  isStaff       : boolean ;
  receiptHeader : string;

  minumumAllowedDateForPurchases: Date
  constructor(
    private router: Router,
    public route: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private sanitizer : DomSanitizer,
    private awsBucket: AWSBucketService,
    private _snackBar: MatSnackBar,
    private siteService: SitesService,
    private fbCompanyService: FbCompanyService,
    private companyService  : CompanyService,

  ) { }

    async ngOnInit() {

      this.bucketName   = await this.awsBucket.awsBucket();
      this.awsBucketURL = await this.awsBucket.awsBucketURL();
      this.selectedIndex = 0
      this.fillForm();
    }

    fillForm() {
      const site        = this.siteService.getAssignedSite();
      if (!site) {
        this.notifyEvent('Site Not selected. Company can not be edited.', 'Alert')
        return
      }

      this.initForm();
      this.companyService.getCompany(site).subscribe( data => {
        if (!data) {return}
        this.company = data;
        this.inputForm.patchValue(data)
      })

    }

    initForm() {
      this.inputForm = this.fbCompanyService.initForm(this.inputForm)
      return this.inputForm
    };

    delete(event) {
      this.notifyEvent('This method is not an option', 'disabled')
    }

    update(event): void {
      const site = this.siteService.getAssignedSite();
      let result = ''
      try {
        const company = this.inputForm.value as ICompany;
        const company$ = this.companyService.updateCompany(site, company)
        company$.subscribe(
          {
          next: data =>{
            this.notifyEvent('Saved', "Saved")
          },
          error: err => {
            this.notifyEvent(err, "Failure")
          }
        }
        )
      } catch (error) {
        this.notifyEvent(result, "Failure")
      }

  };

  updateExit(event) {
    this.update(event)
    this.navSettings(event);
  }

  navSettings(event) {
    this.router.navigateByUrl('/app-settings')
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
