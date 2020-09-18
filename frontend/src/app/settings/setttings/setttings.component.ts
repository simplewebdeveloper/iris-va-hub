import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../settings.service';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-setttings',
  templateUrl: './setttings.component.html',
  styleUrls: ['./setttings.component.css']
})
export class SetttingsComponent implements OnInit {

  public successUserMessage: string;
  public errorUserMessage: string;

  constructor(
    private settingsService: SettingsService,
  ) { }

  ngOnInit() {
  }

  wipeAndResetModels() {
    const sure = window.confirm('Are you sure ?');
    if(sure) {
    this.settingsService.wipeAndResetModels().subscribe(
      (res) => {
        // console.log(res);
        this.successUserMessage = 'Success wiping and resetting models';
        this.toggleUserMessage(this.successUserMessage, 'success');
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
