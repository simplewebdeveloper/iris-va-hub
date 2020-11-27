import { Component, OnInit } from '@angular/core';

// Import home service
import { DashboardService } from '../dashboard.service';

@Component({
  selector: 'app-home',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    public dashboard_service: DashboardService,
  ) { }

  ngOnInit() {

  }



}
