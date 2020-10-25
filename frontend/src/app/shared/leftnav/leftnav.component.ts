import { AfterContentChecked, AfterViewChecked, AfterViewInit, Component, OnChanges, OnInit} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AuthService } from "../../auth/auth.service";
import { VaService } from '../../va/va.service';

@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.css']
})
export class LeftnavComponent implements OnInit {
  private currentPath = ""
  show_va_menu: boolean;
  project_id: any;
  va_id: any;

  constructor(
    private router: Router, 
    private va_service: VaService,
    private authService: AuthService,
    private route: ActivatedRoute,
    ) { 
  }

  ngOnInit() {
    this.router.events.subscribe(
      (event: any) => {
        if (event instanceof NavigationEnd) {
          this.currentPath = this.router.url;
          // this.currentPath = this.currentPath.replace('/', '');
          this.currentPath = this.currentPath.replace(/[0-9]/g, '');
          this.currentPath = this.currentPath.replace(/\\|\//g,'');

        }
      }
    );

  this.checks();
    
  }


  logout() {
    this.authService.logout();
  }

  checks() {

    setInterval(()=>{                           
      this.check_for_va();
    }, 1000);
  
}

check_for_va() {

  // check if va service contains a va
  const va = this.va_service.get_va_id();
 if(va) {
   this.show_va_menu = true;
 } else {
   this.show_va_menu = false;
 }

}

// Navigation functions

navigate_to_va() {
  this.project_id = this.va_service.get_project_id();
  this.va_id = this.va_service.get_va_id();
  this.router.navigate(['/va',this.va_id]);
}

navigate_to_intents() {
  this.project_id = this.va_service.get_project_id();
  this.va_id = this.va_service.get_va_id();
  this.router.navigate(['/intents', {va_id: this.va_id, project_id: this.project_id}]);
}

navigate_to_svps() {
  this.project_id = this.va_service.get_project_id();
  this.va_id = this.va_service.get_va_id();
  this.router.navigate(['/svps', {va_id: this.va_id, project_id: this.project_id}]);
}

navigate_to_train() {
  this.project_id = this.va_service.get_project_id();
  this.va_id = this.va_service.get_va_id();
  this.router.navigate(['/train', {va_id: this.va_id, project_id: this.project_id}]);
}

navigate_to_test() {
  this.project_id = this.va_service.get_project_id();
  this.va_id = this.va_service.get_va_id();
  this.router.navigate(['/test', {va_id: this.va_id, project_id: this.project_id}]);
}



}
