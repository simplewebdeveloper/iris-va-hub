import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {ChatboxService} from '../chatbox.service';
import * as uikit from 'uikit';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ChatboxModel} from '../../models/chatbox.model';
import { HttpErrorResponse } from '@angular/common/http';
// Temp update
import { HomeService } from "../../home/home.service";

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent implements OnInit {
  @ViewChild('queryInput', {static: false}) queryInput: ElementRef;

  chatboxForm: FormGroup;
  chatboxModel = new ChatboxModel();
  private fullResponse: any;
  private thinking = false;
  private resAndQue = [];
  private formattedResponse = '';
  public successUserMessage: string;
  public errorUserMessage: string;
  va_tag: string

  constructor(
    private chatboxService: ChatboxService,
    private homeService: HomeService,
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.initializeChatboxForm();
  }
  initializeChatboxForm(): void {
    this.chatboxForm = this.formBuilder.group({
      query: [this.chatboxModel.query, Validators.required]
    });
  }
  chatboxQueryFormSubmit(event: any) {
    this.va_tag = this.homeService.getVaTag();
    const query = this.chatboxForm.getRawValue();
    const utterance = query.query;
    if (utterance.length > 1) {
      this.thinking = true;
      this.chatboxService.chatboxQuery(query, this.va_tag).subscribe(
      (test_response) => {
        if (test_response) {
          this.fullResponse = test_response

          // Default Template > Replace with any
          this.formattedResponse = this.default_template(test_response, utterance)

          // Clean up
          this.resAndQue.unshift(this.formattedResponse);
          this.resAndQue.unshift(utterance);
          this.thinking = false;
          this.selectInputText();
        }
      },
        (err: HttpErrorResponse) => {
        console.log(err);
        this.errorUserMessage = err.error;
        this.toggleUserMessage(this.errorUserMessage, 'danger');
        }
      );
    }
  }

  // Example default template
  default_template(response, utterance, format='') {
      console.log(response);
          format = 'you are asking about: ' + '<span class="uk-text-bold">' + response.intent['intent'] + '</span>' + '<br />';
          if(response.intent['intent']== 'archivist_handover') {
            format = 'Welcome to the Archivist VA. You can ask me about news'
          }
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

  toggleUserMessage(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

  closeConversation() {
    this.resAndQue = [];
    this.fullResponse = '';
    this.queryInput.nativeElement.value = '';

  }

}
