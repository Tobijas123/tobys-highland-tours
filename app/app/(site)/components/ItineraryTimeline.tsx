'use client'

type ItineraryStop = {
  time?: string
  location: string
  description?: string
  duration?: string
}

interface ItineraryTimelineProps {
  stops: ItineraryStop[]
  title?: string
}

export default function ItineraryTimeline({ stops, title = 'Your Day at a Glance' }: ItineraryTimelineProps) {
  if (!stops || stops.length === 0) return null

  return (
    <div style={{ marginTop: 32 }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 800,
          marginBottom: 16,
          color: 'var(--navy)',
        }}
      >
        {title}
      </h2>
      <div style={{ position: 'relative', paddingLeft: 28 }}>
        {/* Timeline line */}
        <div
          style={{
            position: 'absolute',
            left: 8,
            top: 8,
            bottom: 8,
            width: 2,
            background: 'var(--border)',
            borderRadius: 1,
          }}
        />

        {stops.map((stop, index) => (
          <div
            key={index}
            style={{
              position: 'relative',
              paddingBottom: index === stops.length - 1 ? 0 : 20,
            }}
          >
            {/* Timeline dot */}
            <div
              style={{
                position: 'absolute',
                left: -24,
                top: 4,
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: index === 0 || index === stops.length - 1 ? 'var(--moss)' : 'var(--navy)',
                border: '2px solid var(--surface)',
                boxShadow: '0 0 0 2px var(--border)',
              }}
            />

            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '12px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
                {stop.time && (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: 'var(--moss)',
                      background: 'var(--mossSoft)',
                      padding: '3px 8px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {stop.time}
                  </span>
                )}
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: 'var(--ink)',
                  }}
                >
                  {stop.location}
                </span>
                {stop.duration && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--muted)',
                      background: 'var(--stoneSoft)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      marginLeft: 'auto',
                    }}
                  >
                    {stop.duration}
                  </span>
                )}
              </div>
              {stop.description && (
                <p
                  style={{
                    margin: '8px 0 0',
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: 'var(--muted)',
                  }}
                >
                  {stop.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
