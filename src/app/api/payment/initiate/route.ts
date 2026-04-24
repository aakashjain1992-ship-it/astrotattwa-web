import { NextRequest } from 'next/server'
import { StandardCheckoutPayRequest } from 'pg-sdk-node'
import { randomUUID } from 'crypto'
import { getPhonePeClient } from '@/lib/payment/phonepe'
import { withErrorHandling, successResponse, validationError } from '@/lib/api/errorHandling'
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit'

export const POST = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.standard)

  const body = await req.json()
  const { amount, name } = body

  if (!amount || typeof amount !== 'number' || amount < 1) {
    throw validationError('Amount must be a number and at least ₹1')
  }
  if (amount > 100000) {
    throw validationError('Amount cannot exceed ₹1,00,000')
  }

  const merchantOrderId = `TEST_${randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase()}`
  const amountInPaisa = Math.round(amount * 100)

  const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/payment-test?orderId=${merchantOrderId}`

  const payRequest = StandardCheckoutPayRequest.builder()
    .merchantOrderId(merchantOrderId)
    .amount(amountInPaisa)
    .redirectUrl(redirectUrl)
    .message(name ? `Payment from ${name}` : 'Test payment')
    .expireAfter(1800)
    .build()

  const client = getPhonePeClient()
  const response = await client.pay(payRequest)

  return successResponse({
    merchantOrderId,
    checkoutUrl: response.redirectUrl,
    state: response.state,
    expireAt: response.expireAt,
  })
})
