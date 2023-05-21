import { Component, EventEmitter, Input, OnInit,Output } from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { UntypedFormGroup , UntypedFormBuilder } from '@angular/forms';
import {  MenuPromptSearchModel, PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';

@Component({
  selector: 'prompt-group-select',
  templateUrl: './prompt-group-select.component.html',
  styleUrls: ['./prompt-group-select.component.scss']
})
export class PromptGroupSelectComponent implements OnInit {

  @Input() productTypeID  : number;
  @Input() inputForm      : UntypedFormGroup;
  @Output() outputProductTypeID   :      EventEmitter<any> = new EventEmitter();

  promptResults$           : Observable<IPromptGroup[]>;

  constructor(private promptGroupservice: PromptGroupService,
              private siteService: SitesService,
              private fb: UntypedFormBuilder,
              )
        { }

  ngOnInit() {
    const search = {} as MenuPromptSearchModel;
    search.pageSize = 1000
    search.pageNumber = 1;
    const site = this.siteService.getAssignedSite();
    this.promptResults$  =  this.promptGroupservice.getPrompts(site)
  }

  onSelect(event) {
    this.outputProductTypeID.emit(event.value)
  }

  removePrompt() { 
    this.outputProductTypeID.emit(0)
  }

}
