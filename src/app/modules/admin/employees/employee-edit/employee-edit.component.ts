import { Component, OnInit, Input, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subscription, of } from 'rxjs';
import { catchError, switchMap, } from 'rxjs/operators';
import { FbContactsService } from 'src/app/_form-builder/fb-contacts.service';
import { clientType, employee, IClientTable, IUser, UserPreferences } from 'src/app/_interfaces';
import { AWSBucketService, AuthenticationService} from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { ClientTypeService, IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { EmployeeService, IEmployeeClient } from 'src/app/_services/people/employee-service.service';
import { JobTypesService } from 'src/app/_services/people/job-types.service';
import { IStatuses } from 'src/app/_services/people/status-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { jobTypes } from 'src/app/_interfaces';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { LabelingService } from 'src/app/_labeling/labeling.service';
import { CoachMarksClass, CoachMarksService } from 'src/app/shared/widgets/coach-marks/coach-marks.service';
import { T } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { ProfileEditorComponent } from '../../profiles/profile-editor/profile-editor.component';
import { CoachMarksButtonComponent } from 'src/app/shared/widgets/coach-marks-button/coach-marks-button.component';
import { ProfileRolesComponent } from '../../profiles/profile-roles/profile-roles.component';
@Component({
  selector: 'employee-edit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
            EditButtonsStandardComponent,ProfileEditorComponent,CoachMarksButtonComponent,
            ProfileRolesComponent,
            SharedPipesModule],
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss']
})
export class EmployeeEditComponent implements OnInit, OnDestroy {

  // coachingPIN
  @ViewChild('coachingPIN', {read: ElementRef}) coachingPIN: ElementRef;
  @ViewChild('coachingPassword', {read: ElementRef}) coachingPassword: ElementRef;
  @ViewChild('coachingUserName', {read: ElementRef}) coachingUserName: ElementRef;
  @ViewChild('coachingUserAuthorized', {read: ElementRef}) coachingUserAuthorized: ElementRef;
  @ViewChild('coachingUserType', {read: ElementRef}) coachingUserType: ElementRef;
  @ViewChild('coachingTermination', {read: ElementRef}) coachingTermination: ElementRef;
  @ViewChild('terminateEmployeeView') terminateEmployeeView: TemplateRef<any>;

  inputForm   : UntypedFormGroup;
  clientForm  : UntypedFormGroup;
  confirmPassword: UntypedFormGroup;
  bucketName  :  string;
  awsBucketURL:  string;

  flagSaved   : boolean;
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

  _user: Subscription;
  user: IUser;
  auths: IUserAuth_Properties

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
              public  labelingService         : LabelingService,
              private userAuthorization       : UserAuthorizationService,
              public authenticationService: AuthenticationService,
              private changeDetectorRef: ChangeDetectorRef,
              public coachMarksService : CoachMarksService,
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

  ngOnDestroy(): void {
    if (this._user) {this._user.unsubscribe()}
  }

  initializeClient() {

    if (!this.employee$) {return}
    let employee    = {} as employee;
    const site      = this.siteService.getAssignedSite();
    const employee$ = this.employeeService.getEmployee(site, this.id)
    this.jobTypes$  = this.jobTypeService.getTypes(site);

    return employee$.pipe(
      switchMap( employee => {
        const client      = {} as IClientTable
        client.firstName  = employee?.firstName;
        client.lastName   = employee?.lastName;
        client.phone      = employee?.phone;
        client.email      = employee?.email
        client.employeeID = employee?.id;
        client.id         = employee?.clientID;
        client.payRate    = employee?.payRate;
        this.client       = client;
        this.inputForm.patchValue(employee);
        if (!employee) { return of(null)}
        return  this.clientTableService.postClientWithEmployee(site, employee)
      }

    )).pipe(
      switchMap(employeeClient => {
        if (!employeeClient) { return of(null)}
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

    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.selectedIndex = 0
    this.initInformation()
  }

  initInformation() {
    const site     = this.siteService.getAssignedSite();
    this.action$ = this.initializeClient().pipe(
        switchMap(data => {
        this.initConfirmPassword();
        this.clientTypes$ = this.clientTypeService.getClientTypes(site);
        this.initUser()
        return of(data)
    }));
  }

  initUser() {
    let user = this.userAuthorization.user;
    if (!user) {
      user = this.authenticationService.userValue
    }
    this.user = user;
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
      // if (this.user && this.user.userPreferences) {
      //   this.initInstructions(this.user.userPreferences as UserPreferences)
      // }
    })
  }

  get terminateEmployeeEnableView() {
    if (this.employee && this.employee.id != 0) {
      return this.terminateEmployeeView
    }
    return null;
  }

  restoreEmployee() {
    const site     = this.siteService.getAssignedSite();
    this.action$ = this.employeeService.retoreEmployee(site, this.employee.id).pipe(switchMap(data => {
      this.siteService.notify(`Employe is restired, PIN is ${data?.password}`, 'Close', 3000)
      this.employee = data;
      this.inputForm.patchValue(this.employee)
      return of(data)
    }))
  }
  terminateEmployee() {
    const site     = this.siteService.getAssignedSite();
    this.action$ = this.employeeService.terminateEmployee(site, this.employee.id).pipe(switchMap(data => {
      this.siteService.notify('Employe is terminated, PIN is changed', 'Close', 3000)
      this.employee = data;
      this.inputForm.patchValue(this.employee)
      return of(data)
    }))
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

    this.inputForm.valueChanges.subscribe(data => {
      this.flagSaved = true;
    })
    return this.inputForm
  };

  viewContact() {

    if (this.client && this.client.id) {
      this.router.navigate(["/profileEditor/", {id:this.client.id}]);
      return
    }
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
        this.flagSaved = true
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
    let empeloyeeClient$: Observable<IEmployeeClient>

    if (this.clientForm) { client  = this.clientForm.value as IClientTable; }

    if (!this.inputForm || !this.inputForm.valid) {
      this.notifyEvent('Error in form', "Failed to Save");
      return of(null);
    }

    if (!this.passwordsMatch && (this.password1 != '' && this.password2 !='')) {
      this.notifyEvent('Passwords do not match', "");
    }

    if (this.inputForm)  { employee = this.inputForm.value as employee; }

    // console.log(employee);


    if (client && employee) {
      if (employee.id == 0) {
        let newEmployee$ = this.employeeService.postEmployee(site, employee);

        empeloyeeClient$ =  newEmployee$.pipe(switchMap(
          data => {
            if (employee.errorMessage) {
              this.notifyEvent('Passwords do not match', "");
              return of(null)
            }
            return  this.employeeService.saveEmployeeClient(site, { message: '', employee:  data, client: client })
          }
        ))
      }

      if (employee.id != 0) {
         empeloyeeClient$ =   this.employeeService.saveEmployeeClient(site, { message: '',  employee:  employee, client: client })
      }

      return empeloyeeClient$.pipe(
        switchMap( data => {
          this.client = data.client;
          this.initClientForm(this.client)
          return of(data)
      }))
    }

    return of(null);

  }

  update(event, exit?: boolean): void {
    const empClient$ = this.getEmployeeClientObservable();
    if (empClient$) {
        this.action$ = empClient$.pipe(
          switchMap(data  => {
            this.notifyEvent('Saved', "Saved")
            this.flagSaved = true;
            if (exit) {
              this.onCancel(event);
            }
            return of(data)
          }),catchError ( err => {
            const message = 'Adding employee failed, please input a unique PIN Code. It may need to be a be a long number';
            this.notifyEvent(message, "Failure")
            return of(err)
          }
        ))
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
    this.update(event, true);

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

  initPopover() {
    if (this.user?.userPreferences && this.user?.userPreferences?.enableCoachMarks ) {
      this.coachMarksService.clear()
      if (this.isStaff && this.coachingPIN) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingPIN.nativeElement, this.labelingService.employeeInfo[5].value));
      }

      if (this.isStaff && this.coachingPassword) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingPassword.nativeElement, this.labelingService.employeeInfo[0].value));
      }
      if (this.isStaff && this.coachingUserName) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingUserName.nativeElement, this.labelingService.employeeInfo[1].value));
      }
      if (this.isStaff && this.coachingUserType) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingUserType.nativeElement, this.labelingService.employeeInfo[2].value));
      }
      if (this.isStaff && this.coachingUserAuthorized) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingUserAuthorized.nativeElement,this.labelingService.employeeInfo[3].value));
      }
      if (this.isStaff && this.coachingTermination) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingTermination.nativeElement,this.labelingService.employeeInfo[4].value));
      }
      this.coachMarksService.showCurrentPopover();
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


