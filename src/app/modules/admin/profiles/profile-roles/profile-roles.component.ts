import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'app-profile-roles',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './profile-roles.component.html',
  styleUrls: ['./profile-roles.component.scss']
})
export class ProfileRolesComponent  {

  @Input() isAuthorized: boolean;
  @Input() inputForm   : UntypedFormGroup;
  constructor() { }



}
