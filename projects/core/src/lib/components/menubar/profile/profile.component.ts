import { Component, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectUserDetails } from '../../../state/core.selectors';
import { Subject, takeUntil } from 'rxjs';
import { SecurityModel } from '@tailormap-viewer/api';
import { SecurityService } from '../../../services/security.service';
import { setLoginDetails, setRouteBeforeLogin } from '../../../state/core.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'tm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent implements OnInit, OnDestroy {

  public userDetails: SecurityModel | null = null;
  private destroyed = new Subject();

  constructor(
    private store$: Store,
    private securityService: SecurityService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  public ngOnInit() {
    this.store$.select(selectUserDetails)
      .pipe(takeUntil(this.destroyed))
      .subscribe(userDetails => {
        this.userDetails = userDetails;
        this.cdr.detectChanges();
      });
  }

  public ngOnDestroy() {
    this.destroyed.next(null);
    this.destroyed.complete();
  }

  public logout() {
    this.securityService.logout$()
      .subscribe(loggedOut => {
        if (loggedOut) {
          this.store$.dispatch(setLoginDetails({ loggedIn: false }));
        }
      });
  }

  public login() {
    this.store$.dispatch(setRouteBeforeLogin({ route: this.router.url }));
    this.router.navigateByUrl('/login');
  }

}
