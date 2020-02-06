import {Component, OnInit, Inject, PLATFORM_ID} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import {CookieService} from '../../../services/cookie.service';
// import * as _ from 'lodash';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {BsModalRef} from 'ngx-bootstrap';
import {Subject} from 'rxjs';
import {FileUploader} from 'ng2-file-upload';

const URL = environment.host + '/uploads';

@Component({
    selector: 'app-admin-categories-dialog',
    templateUrl: './categories-dialog.component.html',
    styleUrls: ['./categories-dialog.component.scss']
})


export class AdminCategoriesDialogComponent implements OnInit {
    public env: any;
    public form: any;
    public category: any;
    public onClose: Subject<boolean>;
    public type = 0;

    constructor(
        private api: Restangular,
        private cookieService: CookieService,
        private router: Router,
        private toast: ToastrService,
        public bsModalRef: BsModalRef
    ) {
    }

    ngOnInit() {
        this.onClose = new Subject();

        this.env = environment;

        this.form = new FormGroup({
            code_group_eng_nm: new FormControl(this.category.code_group_eng_nm, [Validators.required]),
        });
    }

    onSave() {

        if (this.category.code_group) {
            this.api
                .one('update-categories', this.category.code_group)
                .customPUT(this.category)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success(
                            'Category has been updated successfully.'
                        );
                        this.onClose.next(true);
                        this.bsModalRef.hide();
                    }
                });
        } else {
            this.api
                .all('add-categories')
                .post(this.category)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success(
                            'Category has been created successfully.'
                        );
                        this.onClose.next(true);
                        this.bsModalRef.hide();
                    }
                });
        }
    }

    close() {
        this.bsModalRef.hide();
    }
}
