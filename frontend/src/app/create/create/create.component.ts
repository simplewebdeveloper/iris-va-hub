// create component.ts
import {Component, OnDestroy, OnInit} from '@angular/core';
// Import create service
import { CreateService } from '../create.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import * as uikit from 'uikit';

import { FormBuilder, FormGroup } from '@angular/forms';
import { Va } from '../../models/va.model';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit, OnDestroy {
  create_va_form: FormGroup;
  va_model: Va;
  projects: any;
  public success_user_message: string;
  public error_user_message: string;


  constructor(
    private create_service: CreateService,
    private dashboard_service: DashboardService,
    private form_builder: FormBuilder,
  ) {
    this.va_model = new Va();
  }

  ngOnInit() {
    this.initialize_create_va_form();
    this.get_projects();
  }

  ngOnDestroy(): void {
    
  }

  initialize_create_va_form(): void {
    this.create_va_form = this.form_builder.group({
      project: this.va_model.project,
      va_name: this.va_model.va_name,
      va_tag: this.va_model.va_tag,
      va_desc: this.va_model.va_desc,
      va_intents: this.va_model.va_intents,
      va_slots: this.va_model.va_slots,
    });
  }

  get_projects() {
    this.dashboard_service.get_all_projects().subscribe(
      (res) => {
        this.projects = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  create_va_form_submit() {
    const data = this.create_va_form.getRawValue();
    if(this.create_va_form.valid) {
    if(!data.va_slots) {
      data.va_slots = 'none'
    }

    this.create_service.create_va(data).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.success_user_message = 'Success creating va: ' + res.va_name ;
        this.toggle_user_message(this.success_user_message, 'success');
        }
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
      }
    );

  }

  }

  toggle_user_message(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

}
