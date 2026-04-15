'use client'

import { useTheme } from '@/components/theme-provider'
import { NUMBER_MEANINGS } from '@/lib/numerology/meanings'
import type { KarmicLesson } from '@/types/numerology'

interface KarmicLessonsProps {
  lessons: KarmicLesson[]
}

export function KarmicLessons({ lessons }: KarmicLessonsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,17,23,0.1)'

  if (lessons.length === 0) {
    return (
      <div style={{
        padding: '20px',
        borderRadius: 12,
        background: 'rgba(16,185,129,0.06)',
        border: '1.5px solid rgba(16,185,129,0.3)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 22, margin: 0 }}>✦</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#10b981', margin: '8px 0 4px' }}>
          No Karmic Lessons
        </p>
        <p style={{ fontSize: 12, color: 'var(--text2)', margin: 0 }}>
          All 9 numbers are present in your grid — a rare and auspicious configuration indicating a soul that has addressed the full range of core life lessons in prior lifetimes.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <p style={{ fontSize: 12, color: 'var(--text3)', margin: 0, lineHeight: 1.6 }}>
        Missing numbers in your Lo Shu Grid indicate karmic lessons — areas where the soul has chosen to grow in this lifetime. These are not weaknesses but invitations.
      </p>
      {lessons.map((lesson) => {
        const meaning = NUMBER_MEANINGS[lesson.number]
        return (
          <div
            key={lesson.number}
            style={{
              border: `1.5px solid ${borderColor}`,
              borderRadius: 12,
              padding: '16px 18px',
              background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(13,17,23,0.01)',
              display: 'flex',
              gap: 16,
            }}
          >
            {/* Number circle */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)',
              border: '1.5px solid rgba(239,68,68,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#ef4444' }}>{lesson.number}</span>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{lesson.lesson}</span>
                {meaning && (
                  <>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>•</span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '1px 7px',
                      borderRadius: 20,
                      background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444',
                    }}>
                      {meaning.planet}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>{meaning.keyword}</span>
                  </>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>
                {lesson.detail}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
