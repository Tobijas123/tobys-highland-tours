'use client'
import React from 'react'

export default function CalendarNavLink() {
  return (
    <a
      href="/admin/calendar"
      className="nav__link"
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
    >
      <span aria-hidden style={{ fontSize: 16 }}>📅</span>
      <span>Kalendarz</span>
    </a>
  )
}
