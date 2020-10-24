import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChatboxService } from '../../shared/chatbox.service';
import * as uikit from 'uikit';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Chatbox } from '../../models/chatbox.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  @ViewChild('queryInput', {static: false}) queryInput: ElementRef;

  chatbox_form: FormGroup;
  chatbox_model = new Chatbox();
  private full_response: any;
  private thinking = false;
  private res_and_que = [];
  private formatted_response = '';
  public success_user_message: string;
  public error_user_message: string;
  project_id: any;
  va_id: any;
  va_tag: any;

  constructor(
    private route: ActivatedRoute,
    private chatbox_service: ChatboxService,
    private form_builder: FormBuilder,
  ) { }

  ngOnInit() {
    this.initializeChatboxForm();
    this.get_project_and_va_id_from_url()
  }

  initializeChatboxForm(): void {
    this.chatbox_form = this.form_builder.group({
      query: [this.chatbox_model.query, Validators.required]
    });
  }

  get_project_and_va_id_from_url() {
    this.project_id = +this.route.snapshot.paramMap.get('project_id');
    this.va_id = +this.route.snapshot.paramMap.get('va_id');
  }

  chatbox_query_form_submit(event: any) {
    const project_id = +this.route.snapshot.paramMap.get('project_id');
    const va_id = +this.route.snapshot.paramMap.get('va_id');
    const query = this.chatbox_form.getRawValue();
    const utterance = query.query;
    if (utterance.length > 1) {
      this.thinking = true;
      this.chatbox_service.chatbox_query(query, project_id, va_id).subscribe(
      (test_response) => {
        if (test_response) {
          this.full_response = test_response
          console.log(this.full_response)

          // Default Template > Replace with any
          this.formatted_response = this.default_template(test_response, utterance)

          // Clean up
          this.res_and_que.unshift(this.formatted_response);
          this.res_and_que.unshift(utterance);
          this.thinking = false;
          this.selectInputText();
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

    // example default template
    default_template(response, utterance, format='') {
      console.log(response);
          format = 'you are asking about: ' + '<span class="uk-text-bold">' + response.intent['intent'] + '</span>' + '<br />';
          // if(response.intent['intent']== 'archivist_handover') {
          //   format = 'Welcome to the Archivist VA. You can ask me about news'
          // }
          if (response.slots.length >= 1) {
          format += ' I have the: <br/>';
          response.slots.forEach((element, index, array) => {
            if (index === (array.length - 1) && array.length > 1) {
              format += ' and ' + element.slot + ' to be ' + element.value;
            } else {
              format += ' ' + element.slot + ' to be ' + element.value + '<br />';
            }
          });
        }
          return format
  }

  selectInputText() {
    <HTMLInputElement>this.queryInput.nativeElement.select();
  }

  toggle_user_message(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

  close_conversation() {
    this.res_and_que = [];
    this.full_response = '';
    this.queryInput.nativeElement.value = '';

  }

}
