import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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

  inputForm     : FormGroup;
  @Input()   prompt         : IPromptGroup;
  id            : any;
  imageMain     : string;
  instructions  : string;
  constructor(
    public        route: ActivatedRoute,
    public           fb: FormBuilder,
    private _snackBar  : MatSnackBar,
    private siteService: SitesService,
    private promptService: PromptGroupService,
    private dialogRef  : MatDialogRef<PromptGroupEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  )
  {
    // console.log('prompt id', data)
    this.inputForm =  this.promptService.initForm(this.inputForm)
    if (data) {
      this.id = data
    } else {
      this.getPrompt(0)
    }
  }

  async ngOnInit() {
    // console.log('prompt id', data)
    if (this.id) {
     const site = this.siteService.getAssignedSite();
     this.prompt = await this.promptService.getPrompt(site, this.id).pipe().toPromise();
     this.getPrompt(this.id)
   }
 }

  getPrompt(id: any) {
    this.inputForm =  this.promptService.initForm(this.inputForm)
    if (  this.inputForm ) {
      if (!id || id == 0) {
        this.prompt  = {} as  IPromptGroup;
      }
      if (this.prompt) {
        this.inputForm.patchValue(this.prompt)
      }
    }
  }

  async updateItem(event): Promise<boolean> {
    let result: boolean;
    return new Promise(resolve => {
       if (this.inputForm.valid) {
        const site = this.siteService.getAssignedSite()
        this.prompt = this.inputForm.value
        const prompt$ = this.promptService.save(site, this.prompt)

        prompt$.subscribe( data => {
          this.notifyEvent('Item Updated', 'Success')
          resolve(true)
        }, error => {
          this.notifyEvent(`Update item. ${error}`, "Failure")
          resolve(false)
        })
        
       }
      }
    )
  };

  async updateItemExit(event) {
    const result = await this.updateItem(event)
    if (result) {
      this.onCancel(event);
    }
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
    console.log( this.prompt)
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
    // this.urlImageOther_ctl.setValue(data)
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
