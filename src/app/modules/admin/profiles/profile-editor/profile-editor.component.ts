import { Component, Input, OnInit } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { IClientTable, IUser, IUserProfile } from 'src/app/_interfaces';
import { AuthenticationService, AWSBucketService, ContactsService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-profile-editor',
  templateUrl: './profile-editor.component.html',
  styleUrls: ['./profile-editor.component.scss']
})
export class ProfileEditorComponent implements OnInit {

  @Input() id: string;

  user = {} as IUserProfile;
  clientTable: IClientTable;

  constructor(
    private router: Router,
    public route: ActivatedRoute,
    public fb: FormBuilder,
    private clientTableService: ClientTableService,
    private sanitizer : DomSanitizer,
    private awsBucket: AWSBucketService,
    private _snackBar: MatSnackBar,
    private siteService: SitesService,
    public contactservice: ContactsService) {

      this.id = this.route.snapshot.paramMap.get('id');

  }

  ngOnInit(){
    this.getUser(this.id)
  }

  getUser(id:string) {
     const site = this.siteService.getAssignedSite();
     const contact$ = this.clientTableService.getClient(site, id)
      contact$.subscribe(data =>
       {
          this.clientTable = data;
        }
      )
  };

  navProductList() {
    this.goBackToList();
  };

  goBackToList() {
    this.router.navigate(["profileSearch"]);
  }

  sanitize(html) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
