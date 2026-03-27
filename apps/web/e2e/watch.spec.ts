import { expect, test } from '@playwright/test'
import { e2eEnv } from './env'
import { cleanupTestStudent, cleanupTestVideo, createTestStudent, createTestVideo } from './helpers/db'

test.describe('学生視聴ポータル', () => {
  test.skip(() => !e2eEnv.DATABASE_URL, 'DATABASE_URL is required')

  test('トークンなしでアクセスするとエラーメッセージが表示される', async ({ page }) => {
    await page.goto('/watch')
    await expect(page.getByText('アクセストークンが必要です。')).toBeVisible()
  })

  test('無効なトークンでアクセスするとエラーメッセージが表示される', async ({ page }) => {
    await page.goto('/watch?token=invalid-token-12345')
    await expect(page.getByText('無効なトークンです。')).toBeVisible()
  })

  test('期限切れトークンでアクセスするとエラーメッセージが表示される', async ({ page }) => {
    const token = `e2e-expired-${Date.now()}`
    const studentId = await createTestStudent({
      name: 'E2E期限切れ学生',
      email: `e2e-expired-${Date.now()}@test.example.com`,
      token,
      expired: true,
    })

    try {
      await page.goto(`/watch?token=${token}`)
      await expect(page.getByText('トークンの有効期限が切れています。')).toBeVisible()
    } finally {
      await cleanupTestStudent(studentId)
    }
  })

  test('有効なトークンでアクセスすると学生ポータルが表示される', async ({ page }) => {
    const token = `e2e-valid-${Date.now()}`
    const studentName = 'E2Eテスト学生'
    const studentId = await createTestStudent({
      name: studentName,
      email: `e2e-valid-${Date.now()}@test.example.com`,
      token,
    })
    const videoId = await createTestVideo(`E2Eテスト動画-${Date.now()}`)

    try {
      await page.goto(`/watch?token=${token}`)
      await expect(page.getByText(`${studentName}様へのコンテンツ`)).toBeVisible({ timeout: 10000 })
    } finally {
      await cleanupTestVideo(videoId)
      await cleanupTestStudent(studentId)
    }
  })

  test('watch-event APIが無効なトークンを拒否する', async ({ request }) => {
    const response = await request.post('/api/watch-event', {
      data: {
        token: 'invalid-token-for-api',
        videoId: 1,
        eventType: 'PLAY',
        positionSec: 0,
        sessionId: 'test-session',
      },
    })

    expect(response.status()).toBe(401)
  })

  test('watch-event APIが有効なトークンで視聴イベントを記録できる', async ({ request }) => {
    const token = `e2e-api-${Date.now()}`
    const studentId = await createTestStudent({
      name: 'E2E APIテスト学生',
      email: `e2e-api-${Date.now()}@test.example.com`,
      token,
    })
    const videoId = await createTestVideo(`E2E APIテスト動画-${Date.now()}`)

    try {
      const response = await request.post('/api/watch-event', {
        data: {
          token,
          videoId,
          eventType: 'PLAY',
          positionSec: 0,
          sessionId: `e2e-session-${Date.now()}`,
        },
      })

      expect(response.status()).toBe(201)
      const body = await response.json()
      expect(body.success).toBe(true)
    } finally {
      await cleanupTestVideo(videoId)
      await cleanupTestStudent(studentId)
    }
  })
})
