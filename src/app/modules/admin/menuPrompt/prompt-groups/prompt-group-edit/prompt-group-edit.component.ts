import { Component, OnInit, Input, Inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-prompt-group-edit',
  templateUrl: './prompt-group-edit.component.html',
  styleUrls: ['./prompt-group-edit.component.scss']
})
export class PromptGroupEditComponent implements OnInit {

  inputForm       : UntypedFormGroup;
  @Input() prompt : IPromptGroup;
  id              : any;
  imageMain       : string;
  instructions    : string;

  constructor(
    public        route: ActivatedRoute,
    public           fb: UntypedFormBuilder,
    private _snackBar  : MatSnackBar,
    private siteService: SitesService,
    private promptService: PromptGroupService,
    private dialogRef  : MatDialogRef<PromptGroupEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  )
  {
    this.prompt  = {} as  IPromptGroup;
    this.inputForm =  this.promptService.initForm(this.inputForm)
    if (data) {
      this.id = data
    } else {
      this.getPrompt(0)
    }
  }

  ngOnInit() {
    if (this.id) {
     const site = this.siteService.getAssignedSite();
      this.promptService.getPrompt(site, this.id).subscribe( data => {
        this.prompt = data ;
        this.getPrompt(data.id)
    })
   }
 }

  getPrompt(id: number) {
    this.inputForm =  this.promptService.initForm(this.inputForm)
    if (  this.inputForm ) {
      if (!id || id == 0) { this.prompt  = {} as  IPromptGroup; }
      if (this.prompt) {
        this.inputForm.patchValue(this.prompt)
      }
    }
  }

  updateItem(close: boolean) {
    let result: boolean;

    if (this.inputForm.valid) {
    const site = this.siteService.getAssignedSite()
    this.prompt = this.inputForm.value
    const prompt$ = this.promptService.save(site, this.prompt)
    prompt$.subscribe( {
        next: data => {
          this.notifyEvent('Item Updated', 'Success')
          if (close) {
            this.onCancel(true)
          }
        }, error: error => {
          this.notifyEvent(`Update item. ${error}`, "Failure")
        }
      }
    )
  }

  };

  updateItemExit(event) {
    this.updateItem(true)
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
    this.promptService.deletePrompt(site, this.prompt.id).subscribe( data =>{
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
