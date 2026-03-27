import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { prisma } from '../../../libs/prisma/client'
import type { AppEnv } from '../middleware'

const watchEventRouter = new Hono<AppEnv>()

const createWatchEventSchema = z.object({
  token: z.string().min(1),
  videoId: z.number().int().positive(),
  eventType: z.enum(['PLAY', 'PAUSE', 'SEEK', 'ENDED', 'HEARTBEAT']),
  positionSec: z.number().min(0).default(0),
  sessionId: z.string().min(1),
})

watchEventRouter.post('/', sValidator('json', createWatchEventSchema), async (c) => {
  const body = c.req.valid('json')

  const student = await prisma.visibleStudent.findFirst({
    where: { token: body.token },
    select: { id: true, tokenExpiresAt: true },
  })

  if (!student || new Date(student.tokenExpiresAt) < new Date()) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  await prisma.watchEvent.create({
    data: {
      studentId: student.id,
      videoId: body.videoId,
      eventType: body.eventType,
      positionSec: body.positionSec,
      sessionId: body.sessionId,
    },
  })

  return c.json({ success: true }, 201)
})

export { watchEventRouter as watchEvent }
