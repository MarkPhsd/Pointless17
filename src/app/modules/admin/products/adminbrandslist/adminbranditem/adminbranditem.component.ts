import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AWSBucketService, ContactsService, MenuService } from 'src/app/_services';
import { IClientTable, IUserProfile }  from 'src/app/_interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { DevService } from 'src/app/_services/system/dev-service.service';
import { UntypedFormBuilder, UntypedFormGroup, FormControl, FormArray, Validator, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FbContactsService } from 'src/app/_form-builder/fb-contacts.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { ValueFieldsComponent } from '../../productedit/_product-edit-parts/value-fields/value-fields.component';
import { UploaderComponent } from 'src/app/shared/widgets/AmazonServices';

@Component({
  selector: 'app-adminbranditem',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    EditButtonsStandardComponent,ValueFieldsComponent,UploaderComponent,
  SharedPipesModule],
  templateUrl: './adminbranditem.component.html',
  styleUrls: ['./adminbranditem.component.scss'],
})

export class AdminbranditemComponent implements OnInit {

  inputForm  : UntypedFormGroup;
  client$      : Observable<IClientTable>;
  clientTable: IClientTable;

  @Input() urlImageMain: string;
  @Input() fileName: string;
  onlineDescription: string;

  //get bucketName(): string { return this.awsBucket.awsBucket; }
  bucketName:             string;
  awsBucketURL:           string;

  id: string;
  result: any;

  childNotifier : Subject<boolean> = new Subject<boolean>();

  constructor(public contactService: ContactsService,
        public fb: UntypedFormBuilder,
        private router: Router,
        public route: ActivatedRoute,
        private devService: DevService,
        private siteService: SitesService,
        private sanitizer : DomSanitizer,
        private fbContactsService: FbContactsService,
        private awsBucket: AWSBucketService,
        private clientTableService: ClientTableService,
        private _snackBar: MatSnackBar) {

    this.id = this.route.snapshot.paramMap.get('id');
    this.initForm();
  }

  async ngOnInit() {
    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.fillForm(this.id);
  };

  initForm() {
    this.inputForm = this.fbContactsService.initForm(this.inputForm)
    return this.inputForm
  };

  fillForm(id: any) {
    const form = this.initForm()
    const site = this.siteService.getAssignedSite();
    const user$ =this.clientTableService.getClient(site, this.id)

    user$.subscribe(user => {
      this.inputForm.patchValue(user)
      this.clientTable = user;
      this.onlineDescription = this.clientTable.onlineDescription ;
      this.urlImageMain = this.clientTable.onlineDescriptionImage ;
    })

  }

  update(event) {
    const site = this.siteService.getAssignedSite();
    this.clientTable = this.inputForm.value;

    if (this.clientTable) {
      this.clientTable.onlineDescription = this.onlineDescription
      this.clientTable.onlineDescriptionImage = this.urlImageMain
    }

    this.clientTableService.saveClient(site, this.clientTable).subscribe(
      {next: data => {
        if (event) { this.goBackToList(); }
        this.notifyEvent("Updated", "Succes")
        return
      },
      error: error => {
        this.notifyEvent("Save error occured: " + error, "failed")
      }
    })


  };

  received_Image($event) {
    try {
      console.log("received_URLMainImage",  $event)
      let data = $event
      this.urlImageMain = data
      this.update(null)
    } catch (error) {
      console.log($event)
    }

    if (this.id) {
      this.update(null);
    }
  };

  updateExit(event) {
    this.update(true);

  };

  onCancel(event) {
    this.goBackToList();
  };

  goBackToList() {
    this.router.navigate(["adminbrandslist"]);
  }

  async delete(event) {
    const client$ = this.clientTableService.delete(this.siteService.getAssignedSite(), this.clientTable.id)
    client$.subscribe(data => {
      this.notifyEvent("Deleted", "Deleted")
      this.onCancel(null);
    });
  }

  removeItemFromArray(itemToRemove : string, arrayString : any): any {
    if (!arrayString){ return }
    let array = arrayString.split(",")
    array.forEach( element => {
      if ( element = itemToRemove ) {
        array.pop()
        return  array.toString()
      }
    });
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
