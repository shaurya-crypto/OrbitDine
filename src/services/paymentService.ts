export interface IPaymentGateway {
  initializePayment(
    amount: number, 
    currency: string, 
    billId: string, 
    onSuccess: () => void, 
    onError: (error: any) => void,
    confirmDialog?: (msg: string) => Promise<boolean>
  ): void;
}

class RazorpayGateway implements IPaymentGateway {
  private key: string;

  constructor() {
    // DO NOT HARDCODE. The user specified to use NEXT_PUBLIC_RAZORPAY_KEY.
    this.key = process.env.NEXT_PUBLIC_RAZORPAY_KEY || "dummy_key_for_dev";
  }

  initializePayment(
    amount: number, 
    currency: string, 
    billId: string, 
    onSuccess: () => void, 
    onError: (error: any) => void,
    confirmDialog?: (msg: string) => Promise<boolean>
  ): void {
    console.log(`[RazorpayGateway] Initializing payment for Bill: ${billId} | Amount: ${amount} ${currency}`);
    
    setTimeout(async () => {
      const msg = `[RAZORPAY SIMULATION]\nPay ${currency} ${amount} for Bill ${billId}?`;
      const confirm = confirmDialog ? await confirmDialog(msg) : window.confirm(msg);
      
      if (confirm) {
        onSuccess();
      } else {
        onError(new Error("Payment cancelled by user"));
      }
    }, 1000);
  }
}

// Future implementations can be added here
// class StripeGateway implements IPaymentGateway { ... }

export const paymentService: IPaymentGateway = new RazorpayGateway();
