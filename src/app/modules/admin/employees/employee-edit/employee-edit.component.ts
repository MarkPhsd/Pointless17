import { Component, OnInit,Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FbContactsService } from 'src/app/_form-builder/fb-contacts.service';
import { clientType, employee, IClientTable, IStatus, IUserProfile } from 'src/app/_interfaces';
import { AWSBucketService, ContactsService, UserService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { EmployeeService, IEmployeeClient } from 'src/app/_services/people/employee-service.service';
import { IStatuses } from 'src/app/_services/people/status-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'employee-edit',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss']
})
export class EmployeeEditComponent implements OnInit {

  inputForm   : FormGroup;
  clientForm  : FormGroup;
  bucketName  :  string;
  awsBucketURL:  string;

  statuses$   : Observable<IStatuses[]>;
  employee$   : Observable<employee>;
  @Input() id : any;

  client: IClientTable;
  employee: employee;

  //for swipping
  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };

  public selectedIndex: number;
  isAuthorized  : boolean ;
  isStaff       : boolean ;

  minumumAllowedDateForPurchases: Date

  constructor(
              private router: Router,
              public route: ActivatedRoute,
              private fb: FormBuilder,
              private sanitizer : DomSanitizer,
              private awsBucket: AWSBucketService,
              private _snackBar: MatSnackBar,
              private employeeService   : EmployeeService,
              private siteService: SitesService,
              private clientTableService: ClientTableService,
              private fbContactsService: FbContactsService,
              private userAuthorization       : UserAuthorizationService,
            ) {

    this.id = this.route.snapshot.paramMap.get('id');
    this.initForm()
    const site = this.siteService.getAssignedSite();
    if (this.id) {
      this.employee$ = this.employeeService.getEmployee(site, this.id)

      this.fillForm(this.id);
    }
    this.isAuthorized =  this.userAuthorization.isUserAuthorized('admin, manager')
    this.isStaff =  this.userAuthorization.isUserAuthorized('admin, manager, employee')
  }

  getClient() {

  }

  async initializeClient() {

    if (!this.employee$) {return}
    let employee = {} as employee;
    const site     = this.siteService.getAssignedSite();
    console.log('continued initializeClient')
    const employee$ = this.employeeService.getEmployee(site, this.id)
    employee = await employee$.pipe().toPromise();

    if (!employee) {return }
    // console.log('initialize client employee checked', this.client )
    const client = {} as IClientTable
    client.firstName = employee.firstName;
    client.lastName = employee.lastName;
    client.phone = employee.phone;
    client.email = employee.email
    client.employeeID = employee.id;
    client.id = employee.clientID;
    this.client = client;

    this.clientTableService.postClientWithEmployee(site, employee).subscribe(employeeClient => {
          console.log(employeeClient)
          employee = employeeClient.employee
          //now we have the id and can assign to the employee.
          employee.clientID = employeeClient.client.id;
          this.client = employeeClient.client;
          this.initClientForm(employeeClient.client)
          this.clientForm.patchValue(this.client)
          this.employee = employeeClient.employee
          this.client.employeeID = employee.id;
          this.employee.clientID = this.client.id;
          this.inputForm.patchValue(employeeClient.employee)
          return EMPTY
          return this.employeeService.putEmployee(site, employee.id,employee)
        }
      )

  }

  updateClient() {
  }

  initClientForm(client: IClientTable) {
    this.clientForm = this.clientForm = this.fbContactsService.initForm(this.clientForm)
    this.clientForm.patchValue(client)
  }

  async ngOnInit() {
    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.selectedIndex = 0
    this.initializeClient();
  }

  async fillForm(id: any) {
    this.initForm()
    const site     = this.siteService.getAssignedSite();
    const employee = await this.employeeService.getEmployee(site, this.id).pipe().toPromise();
    this.employee  = employee;
    if (!employee) {return}
    this.inputForm.patchValue(employee)
  }

  initForm() {
    this.inputForm = this.employeeService.initForm(this.inputForm)
    return this.inputForm
  };

  viewContact() {
    if (this.client) {
      this.router.navigate(["/profileEditor/", {id:this.client.id}]);
    }
  }

  getEmployeeClientObservable(): Observable<IEmployeeClient> {

    const site     = this.siteService.getAssignedSite();
    let client = {} as IClientTable
    let employee = {} as employee

    if (this.clientForm) { client  = this.clientForm.value as IClientTable; }

    if (this.inputForm && !this.inputForm.valid) {
      this.notifyEvent('Error in form', "Failed to Save");
      return EMPTY;
    }

    if (this.inputForm)  { employee = this.inputForm.value as employee; }

    if (client && employee) {
      if (employee.id == 0) {
        const newEmployee$ = this.employeeService.postEmployee(site, employee)
        return  newEmployee$.pipe(
            switchMap(data => {
              return  this.employeeService.saveEmployeeClient(site, { employee:  data, client: client })
        }))
      }

      if (employee.id != 0) {
          return  this.employeeService.saveEmployeeClient(site, { employee:  employee, client: client })
        }
      }

    return EMPTY

  }

  update(event): void {

    if (!this.clientForm && !this.inputForm) {
      this.notifyEvent('Error in form', "Failed to Save")
      return
    }

    // employee.password = client.apiPassword;
    const empClient$ = this.getEmployeeClientObservable();

    if (empClient$) {
        empClient$.subscribe(data =>{
          this.notifyEvent('Saved', "Saved")
        },
        err => {
          this.notifyEvent('Adding employee failed, please input a unique PIN Code. It may need to be a be a long number', "Failure")
        }
      )
    }
  };

  saveClient() {
    const site = this.siteService.getAssignedSite();
    if (this.employee) {
      const employee = this.employee;
      let client = {} as IClientTable;
      client = this.clientForm.value;
      client.firstName = employee.firstName;
      client.lastName = employee.lastName;
      client.phone = employee.phone;
      client.email = employee.email
      if (employee.terminationDate) {
        client.apiUserName = ''
        client.apiPassword = ''
      }
      this.clientTableService.putClient(site, client.id, client).subscribe( data => {
        this.notifyEvent('Saved', "Success")
      })
    }
  }

  updateItemExit(event) {
    this.update(event);
    this.onCancel(event);
  };

  navUserList(event) {
    this.onCancel(null);
  };

  onCancel(event) {
    this.router.navigate(["employee-list"]);
  }

  delete(event) {
    const result =  window.confirm('Are you sure you want to delete this profile?')
    if (result == true && this.id) {
      const site = this.siteService.getAssignedSite();
      const client$ = this.employeeService.delete(site, this.id)
      client$.subscribe( data => {
        this.notifyEvent('This profile has been removed.', 'Success')
        this.router.navigateByUrl('/employee-list')
      })
    }
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


