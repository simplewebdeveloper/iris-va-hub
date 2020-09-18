import { Component, OnInit } from '@angular/core';
import {HomeService} from '../home.service';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-bot-cards',
  templateUrl: './bot-cards.component.html',
  styleUrls: ['./bot-cards.component.css']
})
export class BotCardsComponent implements OnInit {
  private bots: any;
  public SuccessUserMessage: string;
  public errorUserMessage: string;
  public showUserMessage = false;

  constructor(
    private homeService: HomeService
  ) { }

  ngOnInit() {
    this.getBots();
  }

  getBots() {
    this.homeService.getAllBots().subscribe(
      (res) => {
        this.bots = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  deleteBot(index, botId) {
      const sure = window.confirm('Are you sure ?')
      if(sure) {
        this.homeService.deleteSingleBot(botId).subscribe(
          (res) => {
            // console.log(res)
          const bot_name = res.bot_name
          this.SuccessUserMessage = 'Success deleting bot: ' + bot_name;
          this.notificationMessage(this.SuccessUserMessage, 'success');
          this.bots.splice(index, 1);
        },
      (err: HttpErrorResponse) => {
      console.log(err);
      this.errorUserMessage = err.error;
      this.notificationMessage(this.errorUserMessage, 'danger');
      }
    );

    }
  }

  notificationMessage(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', 'status': status});
  }

}
