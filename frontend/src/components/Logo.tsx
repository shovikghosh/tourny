export default function Logo() {
  return (
    <div className="flex items-center">
      <div className="bg-gradient-to-r from-primary to-secondary h-10 w-10 rounded-lg flex items-center justify-center shadow-md">
        <span className="text-white font-bold text-xl">T</span>
      </div>
      <div className="ml-3 font-heading">
        <span className="font-bold text-2xl text-foreground tracking-tight">TOURNY</span>
        <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wider -mt-1">Table Tennis Manager</span>
      </div>
    </div>
  );
} 