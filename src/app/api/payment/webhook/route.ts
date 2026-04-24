import { NextRequest, NextResponse } from 'next/server'
import { getPhonePeClient } from '@/lib/payment/phonepe'

// Username + password are set by you when creating the webhook on the
// PhonePe Business dashboard — store them in .env.local.
const WEBHOOK_USERNAME = process.env.PHONEPE_WEBHOOK_USERNAME ?? ''
const WEBHOOK_PASSWORD = process.env.PHONEPE_WEBHOOK_PASSWORD ?? ''

// Events handled:
//   pg.order.completed          — payment succeeded
//   pg.order.failed             — payment failed / cancelled / timed out
//   pg.refund.completed         — refund successfully credited back to customer
//   pg.refund.failed            — refund attempt failed (needs manual action)
//   payment.dispute.created     — customer raised a chargeback (respond within deadline)
//   payment.dispute.action_required — PhonePe needs your response on a dispute

export async function POST(req: NextRequest) {
  try {
    const authorization = req.headers.get('authorization') ?? ''
    const rawBody = await req.text()

    // Validate the callback signature using the SDK
    const client = getPhonePeClient()
    const callback = client.validateCallback(
      WEBHOOK_USERNAME,
      WEBHOOK_PASSWORD,
      authorization,
      rawBody
    )

    const eventType = callback.eventType

    // --- Order events (pg.order.completed / pg.order.failed) ---
    if (eventType === 'pg.order.completed' || eventType === 'pg.order.failed') {
      const { state, merchantOrderId, amount } = callback.orderDetails ?? {}
      console.log(`[PhonePe Webhook] ${eventType}`, {
        state,           // COMPLETED | FAILED
        merchantOrderId,
        amountRs: amount ? amount / 100 : null,
      })
      // TODO: update payments table
      // await supabase.from('payments').update({ state }).eq('merchant_order_id', merchantOrderId)
    }

    // --- Refund events (pg.refund.completed / pg.refund.failed) ---
    else if (eventType === 'pg.refund.completed' || eventType === 'pg.refund.failed') {
      const { state, merchantOrderId, amount } = callback.orderDetails ?? {}
      console.log(`[PhonePe Webhook] ${eventType}`, {
        state,           // COMPLETED | FAILED
        merchantOrderId,
        refundAmountRs: amount ? amount / 100 : null,
      })
      // TODO: update payments/refunds table
      // await supabase.from('payments').update({ refund_state: state }).eq('merchant_order_id', merchantOrderId)
    }

    // --- Dispute events (payment.dispute.created / payment.dispute.action_required) ---
    else if (
      eventType === 'payment.dispute.created' ||
      eventType === 'payment.dispute.action_required'
    ) {
      // Disputes are time-sensitive — log prominently so you act quickly
      console.warn(`[PhonePe Webhook] ⚠️ DISPUTE ${eventType}`, {
        eventType,
        rawBody, // log full body until dispute handling is built
      })
      // TODO: send admin alert email / Slack notification
    }

    else {
      // Unexpected event type — log and ignore
      console.warn('[PhonePe Webhook] Unhandled event type:', eventType)
    }

    // Always return 200 — PhonePe retries on non-2xx
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PhonePe Webhook] Validation failed:', err)
    return NextResponse.json({ success: false }, { status: 400 })
  }
}
