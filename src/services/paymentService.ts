export interface IPaymentGateway {
  initializePayment(amount: number, currency: string, billId: string, onSuccess: () => void, onError: (error: any) => void): void;
}

class RazorpayGateway implements IPaymentGateway {
  private key: string;

  constructor() {
    // DO NOT HARDCODE. The user specified to use NEXT_PUBLIC_RAZORPAY_KEY.
    this.key = process.env.NEXT_PUBLIC_RAZORPAY_KEY || "dummy_key_for_dev";
  }

  initializePayment(amount: number, currency: string, billId: string, onSuccess: () => void, onError: (error: any) => void): void {
    // In a real integration, we would load the Razorpay script dynamically,
    // fetch an order ID from our backend, and open the modal.
    // For this MVP, we simulate the gateway popup.
    console.log(`[RazorpayGateway] Initializing payment for Bill: ${billId} | Amount: ${amount} ${currency}`);
    
    // Simulate network delay for the popup
    setTimeout(() => {
      const confirm = window.confirm(`[RAZORPAY SIMULATION]\nPay ${currency} ${amount} for Bill ${billId}?`);
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
