import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AuditChartsProps {
  estimated_waste: number;
  potential_savings: number;
  monthly_spend: number;
  platformScores?: {
    campaign_structure: number;
    tracking_analytics: number;
    budget_allocation: number;
    best_practices: number;
  };
}

export function WasteBreakdownChart({ estimated_waste, potential_savings, monthly_spend }: Pick<AuditChartsProps, 'estimated_waste' | 'potential_savings' | 'monthly_spend'>) {
  const efficient_spend = monthly_spend - estimated_waste;

  const data = [
    { name: 'Efficient Spend', value: efficient_spend / 100, color: '#22C55E' },
    { name: 'Wasted Spend', value: estimated_waste / 100, color: '#EF4444' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Current Spend Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Efficient</p>
          <p className="text-2xl font-bold text-green-900">£{(efficient_spend / 100).toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Wasted</p>
          <p className="text-2xl font-bold text-red-900">£{(estimated_waste / 100).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export function ROIImprovementChart({ potential_savings, monthly_spend }: Pick<AuditChartsProps, 'potential_savings' | 'monthly_spend'>) {
  const current_efficiency = ((monthly_spend / 100) - 1) / (monthly_spend / 100) * 100;
  const improved_efficiency = ((monthly_spend / 100) - (potential_savings / 100)) / (monthly_spend / 100) * 100;

  const data = [
    {
      name: 'Current State',
      'Monthly Spend': monthly_spend / 100,
      'Wasted': (monthly_spend * 0.35) / 100
    },
    {
      name: 'After Optimization',
      'Monthly Spend': (monthly_spend - potential_savings) / 100,
      'Wasted': (monthly_spend * 0.10) / 100
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-4">ROI Improvement Potential</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => `£${value.toLocaleString()}`} />
          <Legend />
          <Bar dataKey="Monthly Spend" fill="#22333B" />
          <Bar dataKey="Wasted" fill="#EF4444" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200">
        <p className="text-sm text-green-700 font-medium mb-2">Potential Monthly Savings</p>
        <p className="text-3xl font-bold text-green-900">£{(potential_savings / 100).toLocaleString()}</p>
        <p className="text-sm text-green-700 mt-2">
          That's <strong>£{((potential_savings * 12) / 100).toLocaleString()}</strong> per year!
        </p>
      </div>
    </div>
  );
}

export function PlatformScoreChart({ platformScores }: { platformScores: NonNullable<AuditChartsProps['platformScores']> }) {
  const data = [
    { category: 'Campaign Structure', score: platformScores.campaign_structure, fullMark: 100 },
    { category: 'Tracking & Analytics', score: platformScores.tracking_analytics, fullMark: 100 },
    { category: 'Budget Allocation', score: platformScores.budget_allocation, fullMark: 100 },
    { category: 'Best Practices', score: platformScores.best_practices, fullMark: 100 }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#22C55E';
    if (score >= 50) return '#FACC15';
    return '#EF4444';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-4">Performance Scorecard</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="category" type="category" width={150} />
          <Tooltip />
          <Bar dataKey="score" fill="#22333B">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-slate-600">Good (70+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span className="text-slate-600">Fair (50-69)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-slate-600">Critical (&lt;50)</span>
        </div>
      </div>
    </div>
  );
}
