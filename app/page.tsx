import { Header } from '@/components/header'
import { StatsCards } from '@/components/stats-cards'
import { FormSection } from '@/components/form-section'
import { TableSection } from '@/components/table-section'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 space-y-8">
        <StatsCards />
        <FormSection />
        <TableSection />
      </main>
    </div>
  )
}
