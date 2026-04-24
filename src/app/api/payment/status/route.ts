import { NextRequest } from 'next/server'
import { getPhonePeClient } from '@/lib/payment/phonepe'
import { withErrorHandling, successResponse, validationError } from '@/lib/api/errorHandling'
import { rateLimit, RateLimitPresets } from '@/lib/api/rateLimit'

export const GET = withErrorHandling(async (req: NextRequest) => {
  await rateLimit(req, RateLimitPresets.lenient)

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')

  if (!orderId) {
    throw validationError('orderId query param is required')
  }

  const client = getPhonePeClient()
  const response = await client.getOrderStatus(orderId)

  return successResponse({
    merchantOrderId: response.merchantOrderId,
    orderId: response.orderId,
    state: response.state,
    amount: response.amount,
    errorCode: response.errorCode ?? null,
    detailedErrorCode: response.detailedErrorCode ?? null,
    paymentDetails: response.paymentDetails ?? [],
  })
})
