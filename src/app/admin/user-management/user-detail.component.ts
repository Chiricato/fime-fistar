import {Component, Inject, OnInit} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {environment} from '../../../environments/environment';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'app-admin-user-detail',
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class AdminUserDetailComponent implements OnInit {
    public env: any;
    public user_no: any;
    public user: any;
    public form: any;
    public roles: any;
    public permission: any;

    constructor(
        private api: Restangular,
        public activeRoute: ActivatedRoute,
        private router: Router,
        private toast: ToastrService) {
    }

    ngOnInit() {
        this.env = environment;
        this.activeRoute.params.forEach((params: Params) => {
            this.user_no = params['id'];
        });
        this.user = {};
        this.user.permission = {};
        this.form = new FormGroup({
            user_no: new FormControl({value: this.user.user_no, disabled: true}, [Validators.required]),
            reg_name: new FormControl(this.user.reg_name, [Validators.required]),
            email: new FormControl(this.user.email, [Validators.required]),
            id: new FormControl(this.user.id, [Validators.required]),
            slug: new FormControl(this.user.slug, [Validators.required]),
            cellphone: new FormControl(this.user.cellphone, [Validators.required]),
            home_addr1: new FormControl(this.user.home_addr1, [Validators.required]),
            active: new FormControl(this.user.active, [Validators.required]),
            password: new FormControl(this.user.password, [Validators.required]),
            allow_comment: new FormControl(this.user.allow_comment, [Validators.required]),
            allow_review: new FormControl(this.user.allow_review, [Validators.required]),
            delete: new FormControl(this.user.delete, [Validators.required]),
            userRole: new FormControl(this.user.role_id, []),
            category: new FormControl(this.user.permission.category, []),
            catalog: new FormControl(this.user.permission.catalog, []),
            tryfree: new FormControl(this.user.permission.tryfree, []),
            review: new FormControl(this.user.permission.review, []),
            banner_slide: new FormControl(this.user.permission.banner_slide, []),
            banner_shop: new FormControl(this.user.permission.banner_shop, []),
            tip: new FormControl(this.user.permission.tip, []),
            product_brand: new FormControl(this.user.permission.product_brand, []),
            notifi: new FormControl(this.user.permission.notifi, []),
            faq: new FormControl(this.user.permission.faq, []),
            blog: new FormControl(this.user.permission.blog, []),
            point: new FormControl(this.user.permission.point, []),
            event: new FormControl(this.user.permission.event, []),
            voucher: new FormControl(this.user.permission.voucher, []),
            user: new FormControl(this.user.permission.user, []),
            hot_fime: new FormControl(this.user.permission.hot_fime, []),
            hashtag: new FormControl(this.user.permission.hashtag, []),
            setting: new FormControl(this.user.permission.setting, []),
            fistar: new FormControl(this.user.permission.fistar, [])
        });
        if (this.user_no) {
            this.getUser();
        }

        this.getRoles();
    }

    getUser() {
        this.api
            .one('admin/user/get', this.user_no)
            .get()
            .subscribe(res => {
                this.user = res.result;
                this.user.deleted = this.user.delete_at === 'N' ? 0 : 1;
                this.user.active = this.user.drmncy_at === 'N' ? 1 : 0;
                console.log(this.user,'this.user1');
            });
    }

    save() {
    console.log(this.user.permission,'this.user.permission');
        console.log(this.user,'this.user2');
        if (this.user_no) {
            this.api.all('admin/user/' + this.user.user_no + '/update').customPOST(this.user).subscribe(res => {
                if (res.result) {
                    if(res.result.error){
                        this.toast.error('Have error. '+ res.result.message);
                    }else{
                        this.toast.success('Update user successfully');
                    }
                    
                    // this.router.navigate(['/admin/user-management']);
                }
            });
        } else {
            this.api.all('admin/user/add').customPOST(this.user).subscribe(res => {
                if (res.result) {
                    if(res.result.error){
                        this.toast.error('Have error. '+ res.result.message);
                    }else{
                        this.toast.success('Add user successfully');
                        this.user = res.result;
                        this.user.deleted = this.user.delete_at === 'N' ? 0 : 1;
                        this.user.active = this.user.drmncy_at === 'N' ? 1 : 0;
                        this.user_no = this.user.user_no;
                    }
                    
                }
            });
        }
    }

    getRoles() {
        this.api.all('admin/roles/get-list').customGET().subscribe(res => {
            this.roles = res.result;
        });
    }
}
