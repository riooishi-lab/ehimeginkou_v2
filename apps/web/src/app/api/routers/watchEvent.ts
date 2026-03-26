import { sValidator } from '@hono/standard-validator'
import { Hono } from 'hono'
import { z } from 'zod'
import { prisma } from '../../../libs/prisma/client'
import type { AppEnv } from '../middleware'

const watchEventRouter = new Hono<AppEnv>()

const createWatchEventSchema = z.object({
  studentId: z.number().int().positive(),
  videoId: z.number().int().positive(),
  eventType: z.enum(['PLAY', 'PAUSE', 'SEEK', 'ENDED', 'HEARTBEAT']),
  positionSec: z.number().min(0).default(0),
  sessionId: z.string().min(1),
})

watchEventRouter.post('/', sValidator('json', createWatchEventSchema), async (c) => {
  const body = c.req.valid('json')

  await prisma.watchEvent.create({
    data: {
      studentId: body.studentId,
      videoId: body.videoId,
      eventType: body.eventType,
      positionSec: body.positionSec,
      sessionId: body.sessionId,
    },
  })

  return c.json({ success: true }, 201)
})

export { watchEventRouter as watchEvent }
