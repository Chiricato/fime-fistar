import { Component, OnInit } from '@angular/core';
import { CookieService } from '../../../../services/cookie.service';
import { Router } from '@angular/router';
import { Restangular } from 'ngx-restangular';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
@Component({
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.component.html',
    styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
    public user: any;
    public isLoading = true;
    public showSidebar = false;
    constructor(private api: Restangular, public translate: TranslateService,
        private cs: CookieService, private router: Router, private toast: ToastrService) {
        translate.use('en');
    }

    ngOnInit() {
        this.user = {};
        if (this.cs.get('X-Token')) {
            this.getProfile();
        } else {
            this.isLoading = false;
            this.router.navigate(['/admin/login']);
        }

    }

    getProfile() {
        this.api.all('fimers').customGET('profile').subscribe(res => {
            this.isLoading = false;
            this.showSidebar = true;
            if (res.result && res.result.isOwner) {
                // document.getElementsByClassName('admin-sidebar')[0].classList.remove('hidden');
                this.user = res.result;
                if(this.router.url == '/admin/try' || this.router.url == '/admin/try/winner' || this.router.url == '/admin/try/delivery'){
                    if(!this.user.permission.tryfree && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/category'){
                    if(!this.user.permission.category && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/categories'){
                    if(!this.user.permission.catalog && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/reviews' || this.router.url == '/admin/ads' || this.router.url == '/admin/reviews/fimer'){
                    if(!this.user.permission.review && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/banners'){
                    if(!this.user.permission.banner_slide && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/bannershop'){
                    if(!this.user.permission.banner_shop && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/tips'){
                    if(!this.user.permission.tip && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/brands'){
                    if(!this.user.permission.product_brand && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/notifications'){
                    if(!this.user.permission.notifi && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/faqs' || this.router.url == '/admin/faq-categories'){
                    if(!this.user.permission.faq && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/blogs'){
                    if(!this.user.permission.blog && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/point-policy' || this.router.url == '/admin/point-log'){
                    if(!this.user.permission.point && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/event'){
                    if(!this.user.permission.event && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/vouchers' || this.router.url == '/admin/voucher-images'){
                    if(!this.user.permission.voucher && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/user-management'){
                    if(!this.user.permission.user && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/hot-fimer'){
                    if(!this.user.permission.hot_fimer && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/hashtags'){
                    if(!this.user.permission.hashtag && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/settings'){
                    if(!this.user.permission.setting && this.user.role_id != 6){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }else if(this.router.url == '/admin/request/fistar' || this.router.url == '/admin/request/partner' || this.router.url == '/admin/banner-fistar' || this.router.url == '/admin/fistar' || this.router.url == '/admin/partner' || this.router.url == '/admin/campaign' || this.router.url == '/admin/images-ai' || this.router.url == '/admin/customer/faq' || this.router.url == '/admin/customer/qa' || this.router.url == '/admin/customer/notification' || this.router.url.indexOf("admin/system")  != -1){
                    if(!this.user.permission.fistar && this.user.role_id != 6 && this.user.role_id != 7){
                        this.toast.error('Not permission');
                        this.router.navigate(['/admin/profile']);
                    }
                }
                console.log(this.user,'1232');
                // this.router.navigate(['/admin/try']);
            } else {
                this.router.navigate(['/']);
            }
        });
    }
    gotoProfile(){
        this.router.navigate(['/admin/profile']);
    }
}
