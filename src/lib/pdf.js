import jsPDF from 'jspdf'
import { platformById } from './platforms'

const PRIMARY = [84, 101, 255]
const ACCENT = [249, 115, 22]
const SLATE_900 = [15, 23, 42]
const SLATE_500 = [100, 116, 139]

export function generateMediaKitPdf(kit) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 48
  let y = 0

  // Header band
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, pageWidth, 130, 'F')

  if (kit.photoDataUrl) {
    try {
      doc.addImage(kit.photoDataUrl, 'JPEG', margin, 28, 74, 74, undefined, 'FAST')
    } catch {
      // ignore bad image
    }
  }

  const textX = kit.photoDataUrl ? margin + 90 : margin
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text(kit.fullName || 'Your Name', textX, 58)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(kit.niche || '', textX, 78)

  const contactLine = [kit.location, kit.email, kit.phone].filter(Boolean).join('   •   ')
  doc.setFontSize(9.5)
  doc.text(contactLine, textX, 96)

  y = 160

  if (kit.bio) {
    doc.setTextColor(...SLATE_900)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    const lines = doc.splitTextToSize(kit.bio, pageWidth - margin * 2)
    doc.text(lines, margin, y)
    y += lines.length * 14 + 20
  }

  // Stats section
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...SLATE_900)
  doc.text('Audience Stats', margin, y)
  y += 10
  doc.setDrawColor(230, 232, 240)
  doc.line(margin, y, pageWidth - margin, y)
  y += 24

  const stats = (kit.stats || []).filter((s) => s.followers || s.engagement)
  const colWidth = (pageWidth - margin * 2) / 2
  stats.forEach((stat, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = margin + col * colWidth
    const rowY = y + row * 60

    const platform = platformById(stat.platform)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...SLATE_900)
    doc.text(platform?.label || stat.platform, x, rowY)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...SLATE_500)
    doc.text(stat.handle ? `@${stat.handle.replace(/^@/, '')}` : '', x, rowY + 14)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...PRIMARY)
    doc.text(stat.followers ? `${stat.followers}` : '—', x, rowY + 34)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...SLATE_500)
    doc.text(stat.engagement ? `${stat.engagement}% engagement` : 'followers', x, rowY + 47)
  })

  y += Math.ceil(stats.length / 2) * 60 + 20

  // Rate card
  const rates = (kit.rates || []).filter((r) => r.service)
  if (rates.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...SLATE_900)
    doc.text('Rate Card', margin, y)
    y += 10
    doc.line(margin, y, pageWidth - margin, y)
    y += 22

    rates.forEach((rate) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(...SLATE_900)
      doc.text(rate.service, margin, y)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...ACCENT)
      const priceText = rate.price ? `₦${rate.price}` : ''
      doc.text(priceText, pageWidth - margin - doc.getTextWidth(priceText), y)

      y += 22
    })
    y += 10
  }

  // Footer
  doc.setDrawColor(230, 232, 240)
  doc.line(margin, 780, pageWidth - margin, 780)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...SLATE_500)
  doc.text('Made with Publicate — publicate.app', margin, 796)

  doc.save(`${(kit.fullName || 'media-kit').replace(/\s+/g, '-').toLowerCase()}-media-kit.pdf`)
}
