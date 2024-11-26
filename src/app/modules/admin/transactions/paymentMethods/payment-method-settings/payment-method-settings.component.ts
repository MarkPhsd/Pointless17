import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { EditSettingsComponent } from '../edit-settings/edit-settings.component';

@Component({
  selector: 'payment-method-settings',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    EditSettingsComponent,
  SharedPipesModule],
  templateUrl: './payment-method-settings.component.html',
  styleUrls: ['./payment-method-settings.component.scss']
})
export class PaymentMethodSettingsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
