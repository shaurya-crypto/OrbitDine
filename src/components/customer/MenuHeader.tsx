"use client";

interface MenuHeaderProps {
  restaurantName: string;
  tableNumber: string;
}

export function MenuHeader({ restaurantName, tableNumber }: MenuHeaderProps) {
  return (
    <div className="pt-8 pb-6 px-6 bg-white sticky top-0 z-40 border-b border-neutral-100">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900 leading-none mb-2 tracking-tight">
            {restaurantName}
          </h1>
          <p className="text-sm font-medium text-neutral-500 uppercase tracking-widest">
            Table {tableNumber}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200 shadow-inner">
          <span className="font-serif text-neutral-900 text-lg">{tableNumber}</span>
        </div>
      </div>
    </div>
  );
}
