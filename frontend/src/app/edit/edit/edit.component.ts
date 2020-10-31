import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { EditService } from '../edit.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { VaService } from '../../va/va.service';

import { FormBuilder, FormGroup } from '@angular/forms';
import { Va } from '../../models/va.model';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy {
  edit_va_form: FormGroup;
  va_model = new Va();
  vas: any;
  projects: any;
  va_id_from_url: number;
  va_id: any;
  va: any;
  project: any;
  public success_user_message: string;
  public error_user_message: string;

  constructor(
    private edit_service: EditService,
    private va_service: VaService,
    private dashboard_service: DashboardService,
    private form_builder: FormBuilder,
  ) {
    this.va_model = new Va();
  }

  ngOnInit() {
    this.initialize_edit_va_form();
    this.get_projects();
    this.get_va();
  }

  ngOnDestroy(): void {
  }

  initialize_edit_va_form(): void {
    this.edit_va_form = this.form_builder.group({
      va_id: this.va_model.id,
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
        console.log(res)
        this.projects = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  get_va() {
      this.va = null;
      this.va = this.va_service.get_current_va();
      this.va_id = this.va.id;
      this.va_service.get_single_va(this.va_id).subscribe(
      (res) => {
        console.log(res);
        
        this.va = res;
        this.edit_va_form.patchValue({
          va_id: this.va.id,
          project: this.va.project,
          va_name: this.va.va_name,
          va_tag: this.va.va_tag,
          va_desc: this.va.va_desc,
          va_intents: this.va.va_intents,
          va_slots: this.va.va_slots,
        });
        if(this.va.va_slots == 'none') {
          this.edit_va_form.patchValue({
            va_slots: 'none',
          });
        }
        const va_name = this.va.va_name;
        if (res.length > 1) {
        this.success_user_message = 'Success getting va: ' + va_name;
        this.toggle_user_message(this.success_user_message, 'success');
        }
    },
    (err: HttpErrorResponse) => {
        console.log(err);
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
    }
      )
  }

edit_va_form_submit() {
      const data = this.edit_va_form.getRawValue();
      console.log(data)

      if(this.edit_va_form.valid) {
      if(!data.va_slots) {
        data.va_slots = 'none'
      }

      if(this.edit_va_form.valid) {
      this.edit_service.save_va(data).subscribe(
        (res) => {
          // console.log(res);
          const va_name = this.va.va_name;
          if(res) {
          this.success_user_message = 'Success updating va: ' + va_name;
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
  }
    toggle_user_message(notificationMessage, status) {
      uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
    }
}
