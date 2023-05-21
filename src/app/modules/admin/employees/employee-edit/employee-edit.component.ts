import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { switchMap, } from 'rxjs/operators';
import { FbContactsService } from 'src/app/_form-builder/fb-contacts.service';
import { clientType, employee, IClientTable } from 'src/app/_interfaces';
import { AWSBucketService} from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { EmployeeService, IEmployeeClient } from 'src/app/_services/people/employee-service.service';
import { JobTypesService } from 'src/app/_services/people/job-types.service';
import { IStatuses } from 'src/app/_services/people/status-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { jobTypes } from 'src/app/_interfaces';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
@Component({
  selector: 'employee-edit',
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss']
})
export class EmployeeEditComponent implements OnInit {

  inputForm   : UntypedFormGroup;
  clientForm  : UntypedFormGroup;
  confirmPassword: UntypedFormGroup;
  bucketName  :  string;
  awsBucketURL:  string;

  statuses$   : Observable<IStatuses[]>;
  employee$   : Observable<employee>;
  action$     : Observable<any>;
  @Input() id : any;

  client      : IClientTable;
  employee    : employee;


  //for swipping
  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };

  public selectedIndex: number;
  isAuthorized        : boolean ;
  isStaff             : boolean ;
  passwordsMatch      = true;

  minumumAllowedDateForPurchases: Date
  clientTypes$: Observable<clientType[]>;
  jobTypes$: Observable<jobTypes[]>;
  password1
  password2

  constructor(
              private router: Router,
              public  route: ActivatedRoute,
              private fb: UntypedFormBuilder,
              private sanitizer : DomSanitizer,
              private awsBucket: AWSBucketService,
              private _snackBar: MatSnackBar,
              private employeeService   : EmployeeService,
              private jobTypeService: JobTypesService,
              private siteService: SitesService,
              private clientTableService      : ClientTableService,
              private fbContactsService       : FbContactsService,
              private clientTypeService       : ClientTypeService,
              private userAuthorization       : UserAuthorizationService,
            ) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.initForm()
    const site = this.siteService.getAssignedSite();
    if (this.id) {
      this.employee$ = this.employeeService.getEmployee(site, this.id)
      this.fillForm(this.id);
    }
    this.isAuthorized =  this.userAuthorization.isManagement //('admin, manager')
    this.isStaff      =  this.userAuthorization.isStaff //('admin,manager, employee')
    this.initConfirmPassword()

  }

  initializeClient() {

    if (!this.employee$) {return}
    let employee    = {} as employee;
    const site      = this.siteService.getAssignedSite();
    const employee$ = this.employeeService.getEmployee(site, this.id)
    this.jobTypes$  = this.jobTypeService.getTypes(site);

    this.action$ = employee$.pipe(
      switchMap( employee => {
        const client      = {} as IClientTable
        client.firstName  = employee.firstName;
        client.lastName   = employee.lastName;
        client.phone      = employee.phone;
        client.email      = employee.email
        client.employeeID = employee.id;
        client.id         = employee.clientID;
        this.client       = client;
        this.inputForm.patchValue(employee);
        return  this.clientTableService.postClientWithEmployee(site, employee)
      }

    )).pipe(
      switchMap(employeeClient => {
        if (!employeeClient.client) {
          if (employeeClient.message) {
            this._snackBar.open(employeeClient.message, 'Error', {verticalPosition: 'bottom', duration:2000})
            return;
          }
          this._snackBar.open('Associated client not made. See Admin', 'Error', {verticalPosition: 'bottom', duration:2000})
          return;
        }

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
        return of(employeeClient)
      }
    ))

  }

  initClientForm(client: IClientTable) {
    this.clientForm = this.fbContactsService.initForm(this.clientForm)
    client.password    = '';
    client.apiPassword = ''
    this.clientForm.patchValue(client)
    this.validateMatchingPasswords2();
  }

  async ngOnInit() {
    const site     = this.siteService.getAssignedSite();
    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.selectedIndex = 0
    this.initializeClient();
    this.initConfirmPassword();
    this.clientTypes$ = this.clientTypeService.getClientTypes(site);
  }

  fillForm(id: any) {
    this.initForm()
    const site     = this.siteService.getAssignedSite();

  }

  initConfirmPassword()  {
    this.confirmPassword = this.fb.group( {
      confirmPassword: ['']
    })
    this.validateMatchingPasswords();
    // this.validateMatchingPasswords2();
  }

  initForm() {
    this.inputForm = this.employeeService.initForm(this.inputForm)
    return this.inputForm
  };

  viewContact() {
    if (this.client) {  this.router.navigate(["/profileEditor/", {id:this.client.id}]); }
  }

  validateMatchingPasswords() {
    try {
      this.confirmPassword.valueChanges.subscribe( data => {
        if (!this.confirmPassword) { this.initConfirmPassword()}
        if (this.confirmPassword) {
          this.password1 = this.confirmPassword.controls['confirmPassword'].value;
          if (this.password1 == this.password2) {
            this.passwordsMatch = true;
            return
          }
        }
        this.passwordsMatch = false
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  validateMatchingPasswords2() {
    try {
      this.clientForm.valueChanges.subscribe( data => {
        if (this.clientForm) {
          this.password2 = this.clientForm.controls['apiPassword'].value;
          if (this.password1 == this.password2) {
            this.passwordsMatch = true;
            return
          }
        }
        this.passwordsMatch = false
      })
    } catch (error) {
      console.log('error', error)
    }
  }


  getEmployeeClientObservable(): Observable<IEmployeeClient> {
    const site     = this.siteService.getAssignedSite();
    let client     = {} as IClientTable
    let employee   = {} as employee

    if (this.clientForm) { client  = this.clientForm.value as IClientTable; }

    if (!this.inputForm || !this.inputForm.valid) {
      this.notifyEvent('Error in form', "Failed to Save");
      return EMPTY;
    }

    if (!this.passwordsMatch && (this.password1 != '' && this.password2 !='')) {
      this.notifyEvent('Passwords do not match', "");
    }

    if (this.inputForm)  { employee = this.inputForm.value as employee; }

    if (client && employee) {
      if (employee.id == 0) {
        const newEmployee$ = this.employeeService.postEmployee(site, employee)
        return  newEmployee$.pipe(
            switchMap(data => {
              return  this.employeeService.saveEmployeeClient(site, { message: '', employee:  data, client: client })
        }))
      }
      if (employee.id != 0) {
        return  this.employeeService.saveEmployeeClient(site, { message: '',  employee:  employee, client: client })
      }
    }
    return EMPTY
  }

  update(event): void {
    const empClient$ = this.getEmployeeClientObservable();
    if (empClient$) {
        empClient$.subscribe(
          {
            next: data => {
            this.notifyEvent('Saved', "Saved")
          },
            error: err => {
            const message = 'Adding employee failed, please input a unique PIN Code. It may need to be a be a long number';
            this.notifyEvent(message, "Failure")
          }
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
      console.log(client)
      if (employee.terminationDate) {
        client.apiUserName = ''
        client.apiPassword = ''
        client.roles = 'user'
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
    // const result =  window.confirm('Are you sure you want to delete this profile?')

    if (this.employee) {
      const site = this.siteService.getAssignedSite();
      const employe$ = this.employeeService.delete(site, this.employee.id)
      employe$.subscribe( data => {
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


