import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { FormBuilder } from '@angular/forms';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  public payPalConfig?: IPayPalConfig;

  allproducts:any=[]
  cartTotalprice:number = 0
  proceedtopaymentbtnclickedstatus:boolean = false
  username:string=""
  flat:string=""
  street:string=""
  state:string=""
  offerClickedStatus:boolean=false
  discountClickStatus:boolean=false
  showSuccess:boolean=false
  showCancel:boolean=false
  showError:boolean=false
  showPaypal:boolean=false

  // address
  addressForm = this.fb.group({
    username:[''],
    flat:[''],
    street:[''],
    state:['']
  })

  constructor(private api:ApiService,private fb:FormBuilder){}

  ngOnInit(): void {
    this.api.getCart().subscribe(
      //200
      (result:any)=>{
        console.log(result);
        this.allproducts = result
        //call getcarttotal
        this.getCartTotal()
        //paypal call
        this.initConfig()
      },
      //400
      (result:any)=>{
        console.log(result.error);
      }
    )
    
  }

  //getcarttotal
  getCartTotal(){
    let total=0
    this.allproducts.forEach((item:any) => {
     total += item.grantTotal
     this.cartTotalprice = Math.ceil(total)
    });
  }

  //removeitem
  removeitem(id:any){
    this.api.removecartitem(id).subscribe(
      (result:any)=>{
        this.allproducts = result
        //update cart total price
        this.getCartTotal()
        //update cart total count
        this.api.cartCount()
      },
      (result:any)=>{
        alert(result.error)
      }
    )
  }

  //emptycart
  emptycart(){
    this.api.emptycart().subscribe(
      (result:any)=>{
        this.allproducts = []
         //update cart total price
         this.getCartTotal()
         //update cart total count
         this.api.cartCount()
      },
      (result:any)=>{
        alert(result.error)
      }
    )
  }

  //icrement cart
  icrement(id:any){
    this.api.incCartItem(id).subscribe(
      //200
      (result:any)=>{
        this.allproducts = result
        //update total
        this.getCartTotal()
      },
      (result:any)=>{
        alert(result.error)
      }
    )
  }

  //decrement
  decrement(id:any){
    this.api.decCartItem(id).subscribe(
      //200
      (result:any)=>{
        this.allproducts = result
        //update total
        this.getCartTotal()
      },
      (result:any)=>{
        alert(result.error)
      }
    )
  }

  //sumbitBtnCliked
  sumbitBtnCliked(){
    //check addressForm is valid
    if(this.addressForm.valid){
        this.proceedtopaymentbtnclickedstatus=true
        this.username = this.addressForm.value.username||""
        this.flat = this.addressForm.value.flat||""
        this.street = this.addressForm.value.street||""
        this.state = this.addressForm.value.state||""
    }
    else{
      alert('Please enter valid inputs!!!')
    }
  }

  //offer clicked
  offerClicked(){
    this.offerClickedStatus = true
  }

  //discount50()
  discount50(){
    let discount = Math.ceil(this.cartTotalprice*50/100)
    this.cartTotalprice-=discount
    this.discountClickStatus=true
  }

    //discount10()
    discount10(){
      let discount = Math.ceil(this.cartTotalprice*10/100)
      this.cartTotalprice-=discount
      this.discountClickStatus=true
    }

    //makepayment()
    makepayment(){
      this.showPaypal =true
    }

    //pay pal payment method
    private initConfig(): void {
      let amount = this.cartTotalprice.toString()
      this.payPalConfig = {
      currency: 'USD',
      clientId: 'sb',
      createOrderOnClient: (data:any) => <ICreateOrderRequest>{
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: amount
                }
              }
            }
          }
        ]
      },
      advanced: {
        commit: 'true'
      },
      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        console.log('onApprove - transaction was approved, but not authorized', data, actions);
        actions.order.get().then((details:any) => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);
        });
      },
      onClientAuthorization: (data) => {
        console.log('onClientAuthorization - you should probably inform your server about completed transaction at this point', data);
        this.showSuccess = true;
        //empty cart
        this.emptycart()
        //hide paypal div
        this.showPaypal=false
        //hide proceedtopaymentbtnclickedstatus
        this.proceedtopaymentbtnclickedstatus=false
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
        this.showCancel=true
         //hide paypal div
         this.showPaypal=false
      },
      onError: err => {
        console.log('OnError', err);
        this.showError=true
         //hide paypal div
         this.showPaypal=false
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      },
    };
    }

    //modalClose()
    modalClose(){
      this.addressForm.reset()
      this.showCancel = false
      this.showError = false
      this.showSuccess = false
      this.showPaypal = false
      this.proceedtopaymentbtnclickedstatus = false
    }

}
