// client/src/components/MacroRing.jsx
// Visual macro ring and nutrient progress bars

export default function MacroRing({ consumed = {}, targets = {}, size = 160 }) {
  const cals = consumed.calories || 0;
  const targetCals = targets.calories || 2000;
  const calPct = Math.min(100, Math.round((cals / (targetCals || 1)) * 100));

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPct / 100) * circumference;

  const protein = consumed.protein_g || 0;
  const targetProtein = targets.protein_g || 140;
  const carbs = consumed.carbs_g || 0;
  const targetCarbs = targets.carbs_g || 240;
  const fat = consumed.fat_g || 0;
  const targetFat = targets.fat_g || 60;

  return (
    <div className="bg-surface rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
        {/* Circular Calorie Ring */}
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#FF6A00"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute text-center">
            <div className="text-2xl font-black text-dark tracking-tight">{Math.round(cals)}</div>
            <div className="text-[10px] uppercase font-bold text-gray-500">of {targetCals} kcal</div>
            <div className="text-[10px] font-semibold text-primary">{calPct}%</div>
          </div>
        </div>

        {/* Macro Progress Bars */}
        <div className="flex-1 w-full space-y-3">
          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-blue-700">Protein</span>
              <span className="text-gray-600">
                <strong>{Math.round(protein)}g</strong> / {targetProtein}g
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (protein / targetProtein) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-amber-700">Carbs (Local Staples)</span>
              <span className="text-gray-600">
                <strong>{Math.round(carbs)}g</strong> / {targetCarbs}g
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (carbs / targetCarbs) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-700">Fats (G-Nuts / Avocado)</span>
              <span className="text-gray-600">
                <strong>{Math.round(fat)}g</strong> / {targetFat}g
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (fat / targetFat) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
