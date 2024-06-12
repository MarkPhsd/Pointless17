import { Component, OnInit, Input, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { PromptSubGroups } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-prompt-sub-group-edit',
  templateUrl: './prompt-sub-group-edit.component.html',
  styleUrls: ['./prompt-sub-group-edit.component.scss']
})
export class PromptSubGroupEditComponent implements OnInit {

  inputForm : UntypedFormGroup;
  @Input()   prompt         : PromptSubGroups;
  id:        any;

  instructions: string;
  imageMain: string;

  constructor(
    public        route: ActivatedRoute,
    public           fb: UntypedFormBuilder,
    private _snackBar  : MatSnackBar,
    private siteService: SitesService,
    private promptService: PromptSubGroupsService,
    private dialogRef  : MatDialogRef<PromptSubGroupEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  )
  {
    this.prompt  = {} as  PromptSubGroups;
    this.inputForm = this.promptService.initForm(this.inputForm)
    if (data) {
      this.id = data
    }
  }

  ngOnInit() {
    this.inputForm.patchValue(this.prompt)
    if (this.id) {
      const site = this.siteService.getAssignedSite();
      const prompt$ = this.promptService.getPromptSub(site, this.id)
      prompt$.subscribe (data => {
        this.prompt = data;
        this.inputForm.patchValue(data)
      })
    }
  }

  updateItem(event) {
    if (!this.inputForm.valid) {
      this.notifyEvent('Item has no value', 'Alert')
      return null
    }
    const site = this.siteService.getAssignedSite()
    this.prompt = this.inputForm.value
    const prompt$ = this.promptService.save(site, this.prompt)
    this.saveItem(prompt$, false)
  };

  updateItemExit(event) {
    if (!this.inputForm.valid) {
      this.notifyEvent('Item has no value', 'Alert')
      return null
    }
    const site = this.siteService.getAssignedSite()
    this.prompt = this.inputForm.value as PromptSubGroups
    const prompt$ = this.promptService.save(site, this.prompt)
    this.saveItem(prompt$, event)
  }

  saveItem(prompt$: Observable<PromptSubGroups>, exit: boolean ) {
    if (!prompt$) {
      this.notifyEvent('Item has no value', 'Alert')
    }
    prompt$.subscribe(
      {
        next: data => {
          this.notifyEvent('Item Updated', 'Success')
          if (exit) {   this.onCancel(event)  }
        },
        error: error => {
          this.notifyEvent(`Update item. ${error}`, "Failure")
        }
      }
    )
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteItem(event) {
    const site = this.siteService.getAssignedSite()
    if (!this.prompt) {
      this._snackBar.open("No Product Selected", "Success")
      return
    }
    this.promptService.deletePromptSub(site, this.prompt.id).subscribe( data =>{
      this._snackBar.open("Item deleted", "Success")
      this.onCancel(event)
    })
  }

  copyItem(event) {
    //do confirm of delete some how.
    //then
  }

  received_URLMainImage(event) {
    if (!this.prompt) { return }
    let data = event
    this.imageMain = data
    this.prompt.image = event
    if (this.id) {  this.updateItem(null); }
  };

  updateUrlImageMain(event) {
    if (!this.prompt) { return }
    this.imageMain = event
    this.prompt.image = event
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
