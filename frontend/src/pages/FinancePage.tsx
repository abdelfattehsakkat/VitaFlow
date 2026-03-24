import { useState } from 'react'
import { TrendingUp, TrendingDown, Scale } from 'lucide-react'
import BilanPage from './BilanPage'
import ChargesPage from './ChargesPage'
import BilanFinalPage from './BilanFinalPage'

type FinanceTab = 'revenus' | 'charges' | 'bilan'

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('revenus')

  const tabs = [
    {
      id: 'revenus' as FinanceTab,
      label: 'Revenus',
      icon: TrendingUp,
      activeClass: 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30',
    },
    {
      id: 'charges' as FinanceTab,
      label: 'Charges',
      icon: TrendingDown,
      activeClass: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
    },
    {
      id: 'bilan' as FinanceTab,
      label: 'Bilan Financier',
      icon: Scale,
      activeClass: 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30',
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 sm:gap-3 p-1 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all duration-200 ${
                isActive ? tab.activeClass : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'revenus' && <BilanPage />}
      {activeTab === 'charges' && <ChargesPage />}
      {activeTab === 'bilan' && <BilanFinalPage />}
    </div>
  )
}
