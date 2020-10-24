import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { EditService } from '../edit.service';
import { DashboardService } from '../../dashboard/dashboard.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Va } from '../../models/va.model';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';
import { ProjectService } from 'src/app/project/project.service';

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
  va: any;
  project: any;
  public success_user_message: string;
  public error_user_message: string;

  

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private edit_service: EditService,
    private project_service: ProjectService,
    private dashboard_service: DashboardService,
    private form_builder: FormBuilder,
  ) {
    this.va_model = new Va();
  }

  ngOnInit() {
    this.initialize_edit_va_form();
    // this.get_vas();
    this.get_projects();
    this.get_va_from_url();
    this.get_project_from_url();
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

  // get_vas() {
  //   this.edit_service.get_all_vas().subscribe(
  //     (res) => {
  //       // console.log(res);
  //       this.vas = res;
  //       if (res.length > 0) {
  //       this.success_user_message = 'Success getting vas';
  //       this.toggle_user_message(this.success_user_message, 'success');
  //       }
        
  //     },
  //     (err: HttpErrorResponse) => {
  //       console.log(err);
  //       this.error_user_message = err.error;
  //       this.toggle_user_message(this.error_user_message, 'danger');
  //     }
  //   );
  // }

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

  get_project_from_url() {
    this.project = null;
    const project_id_from_url = +this.route.snapshot.paramMap.get('project_id');
    // console.log(project_id_from_url)
    
    this.project_service.get_single_project(project_id_from_url).subscribe(
    (res) => {
      // console.log(res);
      this.project = res;
     
      const project_name = this.project.project_name;
      if (res.length > 0) {
      this.success_user_message = 'Success getting va: ' + project_name;
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

set_project_and_va_id(project_id, va_id) {
  this.edit_service.set_project_and_va_id(project_id, va_id);
}


  get_va_from_url() {
      this.va = null;
      const va_id_from_url = +this.route.snapshot.paramMap.get('va_id');
      if(this.get_va_from_url) (
      this.edit_service.get_single_va(va_id_from_url).subscribe(
      (res) => {
        console.log(res);
        
        this.va = res;
        this.set_project_and_va_id(this.va.project, this.va.id)
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
      ));
  }

//   get_va_from_drop_down(event: any) {
//     this.va = null;
//     const va_id_from_drop_down = event.target.value;
//     this.edit_service.get_single_va(va_id_from_drop_down).subscribe(
//     (res) => {
//       // console.log(res);
//       this.va = res;
//       this.edit_va_form.patchValue({
//         va_id: this.va.id,
//         project: this.va.project,
//         va_name: this.va.va_name,
//         va_tag: this.va.va_tag,
//         va_desc: this.va.va_desc,
//         va_intents: this.va.va_intents,
//         va_slots: this.va.va_slots,
//       });
//       if(this.va.va_slots == 'none') {
//         this.edit_va_form.patchValue({
//           va_slots: '',
//         });
//       }
//       const va_name = this.va.va_name;
//       if (res.length > 1) {
//       this.success_user_message = 'Success getting va: ' + va_name;
//       this.toggle_user_message(this.success_user_message, 'success');
//       }
//   },
//   (err: HttpErrorResponse) => {
//       console.log(err);
//       this.error_user_message = err.error;
//       this.toggle_user_message(this.error_user_message, 'danger');
//   }
//     );
// }

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
