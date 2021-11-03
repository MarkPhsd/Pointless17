import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AWSBucketService, ContactsService, MenuService } from 'src/app/_services';
import { IClientTable, IUserProfile }  from 'src/app/_interfaces';
import { ActivatedRoute, Router } from '@angular/router';
import { DevService } from 'src/app/_services/system/dev-service.service';
import { FormBuilder, FormGroup, FormControl, FormArray, Validator } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FbContactsService } from 'src/app/_form-builder/fb-contacts.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-adminbranditem',
  templateUrl: './adminbranditem.component.html',
  styleUrls: ['./adminbranditem.component.scss'],
})

export class AdminbranditemComponent implements OnInit {

  inputForm  : FormGroup;
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
        public fb: FormBuilder,
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

  async fillForm(id: any) {
    const form = this.initForm()
    console.log('this.id', id)
    const site = this.siteService.getAssignedSite();
    const user = await this.clientTableService.getClient(site, this.id).pipe().toPromise();
    this.inputForm.patchValue(user)
    this.clientTable = user;
    this.onlineDescription = this.clientTable.onlineDescription ;
    this.urlImageMain = this.clientTable.onlineDescriptionImage ;

    this.client$ = this.clientTableService.getClient(site, this.id).pipe(
      tap(data => {
        this.inputForm.patchValue(data)
        console.log('data', data)
        this.onlineDescription = this.clientTable.onlineDescription ;
        this.urlImageMain = this.clientTable.onlineDescriptionImage ;
        return
       })
    );

  }

  async update(event) {
    const site = this.siteService.getAssignedSite();
    if (this.clientTable) {
      this.clientTable.onlineDescription = this.onlineDescription
      this.clientTable.onlineDescriptionImage = this.urlImageMain
    }
    let promise =  await this.clientTableService.saveClient(site, this.clientTable).pipe().toPromise()
    if (promise)
    {
      this.notifyEvent("Updated", "Succes")
    } else {
      this.notifyEvent("Failed", "failed")
    }
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

    console.log("this id ", this.id)
    if (this.id) {
      this.update(null);
    }
  };

  updateExit(event) {
    this.update(event);
    this.goBackToList();
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
