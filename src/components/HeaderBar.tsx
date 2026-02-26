"use client";

export function HeaderBar({
  title,
  subtitle,
  hoursWeek,
}: {
  title?: string;
  subtitle?: string;
  hoursWeek?: string;
}) {
  return (
    <header className="bg-slate-800/50 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
      <div>
        {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
        {subtitle && (
          <p className="text-sm text-slate-400">{subtitle}</p>
        )}
      </div>
      {hoursWeek !== undefined && (
        <span className="text-sm text-amber-400 font-medium">
          Horas apontadas na semana: {hoursWeek}
        </span>
      )}
    </header>
  );
}
