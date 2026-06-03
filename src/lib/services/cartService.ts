import { IOrderSession } from "@/models/OrderSession";
import { IRestaurant } from "@/models/Restaurant";

export function calculateCartTotals(session: IOrderSession, restaurant: IRestaurant) {
  let subtotal = 0;
  
  // Calculate item totals
  for (const item of session.cart) {
    let itemBaseTotal = item.price * item.quantity;
    let addonsTotal = 0;
    if (item.addons && item.addons.length > 0) {
      for (const addon of item.addons) {
        addonsTotal += addon.price * item.quantity;
      }
    }
    item.itemTotal = itemBaseTotal + addonsTotal;
    subtotal += item.itemTotal;
  }

  // Calculate discounts (placeholder for future loyalty/games logic)
  let discount = 0;
  if (session.appliedDiscounts && session.appliedDiscounts.length > 0) {
    for (const d of session.appliedDiscounts) {
      discount += d.amount;
    }
  }

  const taxableAmount = Math.max(0, subtotal - discount);

  // Apply taxes and service charges based on restaurant settings
  const taxPercentage = restaurant.settings?.taxPercentage || 0;
  const serviceChargePercentage = restaurant.settings?.serviceChargePercentage || 0;

  const tax = (taxableAmount * taxPercentage) / 100;
  const serviceCharge = (taxableAmount * serviceChargePercentage) / 100;
  
  const grandTotal = taxableAmount + tax + serviceCharge;

  return {
    cart: session.cart,
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    serviceCharge: Number(serviceCharge.toFixed(2)),
    grandTotal: Number(grandTotal.toFixed(2)),
  };
}
