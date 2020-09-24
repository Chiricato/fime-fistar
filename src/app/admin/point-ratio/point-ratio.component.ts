import {
    Component,
    OnInit,
    Inject,
    PLATFORM_ID,
    ViewChild
} from '@angular/core';

import {Restangular} from 'ngx-restangular';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {AngularFileUploaderComponent} from 'angular-file-uploader';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';

import {CookieService} from '../../../services/cookie.service';
import {environment} from '../../../environments/environment';
import {ImageCroppedEvent} from 'ngx-image-cropper';
import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap';

@Component({
    selector: 'app-admin-point-ratio',
    templateUrl: './point-ratio.component.html',
    styleUrls: ['./point-ratio.component.scss']
})
export class PointRatioComponent implements OnInit {
    public env: any;
    public ratio: any;
    public onClose: Subject<boolean>;

    constructor(
        private api: Restangular,
        private cookieService: CookieService,
        private router: Router,
        public activeRoute: ActivatedRoute,
        public bsModalRef: BsModalRef,
        private toast: ToastrService,
        private translate: TranslateService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit() {
        this.onClose = new Subject();
        this.env = environment;
        console.log(this.ratio);
    }
    close() {
        this.bsModalRef.hide();
    }

    onSave() {
        this.api
            .one('point-ratio')
            .customPUT(this.ratio)
            .subscribe(res => {
                if (res.result) {
                    this.toast.success('Update membership point ration successfully');
                     this.bsModalRef.hide();
                }
            });
    }
}
