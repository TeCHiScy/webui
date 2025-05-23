import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit,
} from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { RequiresRolesDirective } from 'app/directives/requires-roles/requires-roles.directive';
import { UiSearchDirective } from 'app/directives/ui-search.directive';
import { Role } from 'app/enums/role.enum';
import { Weekday } from 'app/enums/weekday.enum';
import { helptextResilver } from 'app/helptext/storage/resilver/resilver';
import { ResilverConfigUpdate } from 'app/interfaces/resilver-config.interface';
import { CalendarService } from 'app/modules/dates/calendar.service';
import { IxCheckboxComponent } from 'app/modules/forms/ix-forms/components/ix-checkbox/ix-checkbox.component';
import { IxFieldsetComponent } from 'app/modules/forms/ix-forms/components/ix-fieldset/ix-fieldset.component';
import { IxSelectComponent } from 'app/modules/forms/ix-forms/components/ix-select/ix-select.component';
import { FormErrorHandlerService } from 'app/modules/forms/ix-forms/services/form-error-handler.service';
import { SnackbarService } from 'app/modules/snackbar/services/snackbar.service';
import { TestDirective } from 'app/modules/test-id/test.directive';
import { ApiService } from 'app/modules/websocket/api.service';
import { resilverConfigElements } from 'app/pages/data-protection/scrub-task/resilver-config/resilver-config.elements';
import { ErrorHandlerService } from 'app/services/errors/error-handler.service';
import { TaskService } from 'app/services/task.service';

@UntilDestroy()
@Component({
  selector: 'ix-resilver-config',
  templateUrl: './resilver-config.component.html',
  styleUrls: ['./resilver-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatCard,
    UiSearchDirective,
    MatCardContent,
    MatProgressBar,
    ReactiveFormsModule,
    IxFieldsetComponent,
    IxCheckboxComponent,
    IxSelectComponent,
    RequiresRolesDirective,
    MatButton,
    TestDirective,
    TranslateModule,
  ],
})
export class ResilverConfigComponent implements OnInit {
  protected readonly searchableElements = resilverConfigElements;
  isFormLoading = false;

  form = this.fb.group({
    enabled: [true],
    begin: [''],
    end: [''],
    weekday: [[
      Weekday.Monday,
      Weekday.Tuesday,
      Weekday.Wednesday,
      Weekday.Thursday,
      Weekday.Friday,
      Weekday.Saturday,
      Weekday.Sunday,
    ], Validators.required],
  });

  protected readonly requiredRoles = [Role.PoolWrite];

  readonly tooltips = {
    enabled: helptextResilver.enabled_tooltip,
    begin: helptextResilver.begin_tooltip,
    end: helptextResilver.end_tooltip,
  };

  daysOfWeek$ = of(this.calendarService.getWeekdayOptions());
  timeOptions$ = of(this.taskService.getTimeOptions());

  constructor(
    private errorHandler: ErrorHandlerService,
    private api: ApiService,
    private formErrorHandler: FormErrorHandlerService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private calendarService: CalendarService,
    private taskService: TaskService,
    private router: Router,
    private snackbar: SnackbarService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.isFormLoading = true;

    this.api.call('pool.resilver.config')
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (config) => {
          this.form.patchValue(config);
          this.isFormLoading = false;
          this.cdr.markForCheck();
        },
        error: (error: unknown) => {
          this.isFormLoading = false;
          this.cdr.markForCheck();
          this.errorHandler.showErrorModal(error);
        },
      });
  }

  onSubmit(): void {
    const values = this.form.value;

    this.isFormLoading = true;
    this.api.call('pool.resilver.update', [values as ResilverConfigUpdate])
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.snackbar.success(this.translate.instant('Resilver configuration saved'));
          this.isFormLoading = false;
          this.cdr.markForCheck();
          this.router.navigate(['/data-protection']);
        },
        error: (error: unknown) => {
          this.isFormLoading = false;
          this.formErrorHandler.handleValidationErrors(error, this.form);
          this.cdr.markForCheck();
        },
      });
  }
}
