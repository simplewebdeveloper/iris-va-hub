// create component.ts
import {Component, OnDestroy, OnInit} from '@angular/core';
// Import create service
import { CreateService } from '../create.service';
import * as uikit from 'uikit';

import {FormBuilder, FormGroup} from '@angular/forms';
import {Bot} from '../../models/bot.model';
import {Subject} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit, OnDestroy {
  // URL to Django Server
  DJANGO_SERVER = 'http://127.0.0.1:8000';
  createBotForm: FormGroup;
  botModel: Bot;
  public SuccessUserMessage: string;
  public errorUserMessage: string;

  private unsubscribeAll: Subject<any>;

  constructor(
    private createService: CreateService,
    private formBuilder: FormBuilder,
  ) {
    this.unsubscribeAll = new Subject();
    this.botModel = new Bot();
  }

  ngOnInit() {
    this.initializeCreateBotForm();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
  }

  initializeCreateBotForm(): void {
    this.createBotForm = this.formBuilder.group({
      bot_name: this.botModel.botName,
      bot_desc: this.botModel.botDesc,
      bot_intents: this.botModel.botIntents,
      bot_slots: this.botModel.botSlots,
    });
  }

  createBotFormSubmit() {
    const data = this.createBotForm.getRawValue();

    if(this.createBotForm.valid) {
    if(!data.bot_slots) {
      data.bot_slots = 'none'
    }

    this.createService.createBot(data).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.SuccessUserMessage = 'Success creating bot: ' + res.bot_name ;
        this.toggleUserMessage(this.SuccessUserMessage, 'success');
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

  toggleUserMessage(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

}
