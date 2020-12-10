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
    selector: 'app-admin-qa-sub-category-dialog',
    templateUrl: './qa-sub-category-dialog.component.html',
    styleUrls: ['./qa-sub-category-dialog.component.scss']
})


export class AdminQaSubCategoryDialogComponent implements OnInit {
    public env: any;
    public form: any;
    public category: any;
    public onClose: Subject<boolean>;
    public type = 0;
    public categories: any;

    constructor(
        private api: Restangular,
        private cookieService: CookieService,
        private router: Router,
        private toast: ToastrService,
        public bsModalRef: BsModalRef
    ) {
    }

    ngOnInit() {
        console.log(this.category);
        this.onClose = new Subject();

        this.env = environment;
        this.getCategories();
        this.form = new FormGroup({
            name: new FormControl(this.category.name, [Validators.required]),
            code_group: new FormControl(this.category.code_group, [Validators.required]),
        });
    }

    onSave() {

        if (this.category.id) {
            this.api
                .one('update-sub-category', this.category.id)
                .customPUT(this.category)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success(
                            'Q&A Sub Category has been updated successfully.'
                        );
                        this.onClose.next(true);
                        this.bsModalRef.hide();
                    }
                });
        } else {
            this.api
                .all('add-qa-sub')
                .post(this.category)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success(
                            'Q&A Sub Category has been created successfully.'
                        );
                        this.onClose.next(true);
                        this.bsModalRef.hide();
                    }
                });
        }
    }
    getCategories() {
        this.api
            .all('getAllCategories')
            .customGET('')
            .subscribe(res => {
                if(res.result)
                {
                    this.categories = res.result;
                    console.log(this.categories);
                }
            });
    }

    close() {
        this.bsModalRef.hide();
    }
}
