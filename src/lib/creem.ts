import type { PricingPlan } from '@/lib/config'

interface CheckoutSessionData {
  planId: string
  planName: string
  price: number
  yearlyPrice: number
  isYearly: boolean
  productId?: string
  customerEmail?: string
  successUrl?: string
  cancelUrl?: string
}

interface CreemCheckoutSession {
  id: string
  url: string
  mode: string
  status: string
}

class CreemService {
  private readonly baseUrl = 'https://api.creem.io/v1'
  private readonly secretKey: string

  constructor() {
    this.secretKey = process.env.CREEM_SECRET_KEY || ''
    if (!this.secretKey) {
      throw new Error('CREEM_SECRET_KEY is not configured')
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'x-api-key': this.secretKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Creem API error: ${response.status} - ${error}`)
    }

    return response.json()
  }

  async createCheckoutSession(data: CheckoutSessionData): Promise<CreemCheckoutSession> {
    if (!data.productId) {
      throw new Error('Product ID is required for Creem checkout')
    }
    
    // Note: Currently only monthly products are set up
    // For yearly billing, you'll need to create separate yearly products in Creem
    if (data.isYearly) {
      console.warn('Yearly billing requested but only monthly products are configured. Using monthly product.')
    }
    
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    const payload = {
      product_id: data.productId,
      success_url: data.successUrl || `${baseUrl}/checkout/success`,
      request_id: `${data.planId}_${Date.now()}`, // Unique request ID
      metadata: {
        plan_id: data.planId,
        plan_name: data.planName,
        billing_type: data.isYearly ? 'yearly' : 'monthly',
        customer_email: data.customerEmail || ''
      }
    }

    const response = await this.makeRequest('/checkouts', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    // Map Creem response to our interface
    return {
      id: response.id,
      url: response.checkout_url, // Creem returns 'checkout_url'
      mode: 'subscription',
      status: 'pending'
    }
  }

  async getCheckoutSession(sessionId: string): Promise<CreemCheckoutSession> {
    return this.makeRequest(`/checkouts/${sessionId}`)
  }

  async createSubscription(customerId: string, priceId: string) {
    const payload = {
      customer_id: customerId,
      price_id: priceId,
      collection_method: 'charge_automatically',
    }

    return this.makeRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async getSubscription(subscriptionId: string) {
    return this.makeRequest(`/subscriptions/${subscriptionId}`)
  }

  async upgradeSubscription(subscriptionId: string, newPlanId: string) {
    const payload = {
      new_plan_id: newPlanId,
    }

    return this.makeRequest(`/subscriptions/${subscriptionId}/upgrade`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async cancelSubscription(subscriptionId: string) {
    return this.makeRequest(`/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    })
  }

  async createCustomer(email: string, name?: string, country?: string) {
    const payload = {
      email,
      ...(name && { name }),
      ...(country && { country }),
    }

    return this.makeRequest('/customers', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  // Convert pricing plan to checkout data
  planToCheckoutData(plan: PricingPlan, isYearly: boolean): CheckoutSessionData {
    const priceString = plan.price.replace('$', '')
    const yearlyPriceString = plan.yearlyPrice.replace('$', '')
    
    return {
      planId: plan.name.toLowerCase().replace(' ', '_'),
      planName: plan.name,
      price: parseFloat(priceString),
      yearlyPrice: parseFloat(yearlyPriceString),
      isYearly,
      productId: plan.creemProductId,
    }
  }
}

export const creem = new CreemService()
export type { CheckoutSessionData, CreemCheckoutSession } 