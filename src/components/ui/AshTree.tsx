export function AshTree({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Ash tree"
    >
      {/* Trunk */}
      <path
        d="M97 280 L97 160 Q95 150 98 140 Q100 130 103 140 Q106 150 103 160 L103 280 Z"
        className="fill-stone-400 dark:fill-stone-600"
      />
      {/* Main lower branches */}
      <path
        d="M98 200 Q70 185 45 190 Q60 178 98 185Z"
        className="fill-stone-400 dark:fill-stone-600"
      />
      <path
        d="M102 200 Q130 185 155 190 Q140 178 102 185Z"
        className="fill-stone-400 dark:fill-stone-600"
      />
      {/* Mid branches */}
      <path
        d="M97 170 Q75 158 55 162 Q68 150 97 158Z"
        className="fill-stone-400 dark:fill-stone-600"
      />
      <path
        d="M103 170 Q125 158 145 162 Q132 150 103 158Z"
        className="fill-stone-400 dark:fill-stone-600"
      />

      {/* Foliage clusters - layered circles for natural look */}
      {/* Bottom left cluster */}
      <circle cx="42" cy="178" r="28" className="fill-forest-400 dark:fill-forest-600 opacity-80" />
      <circle cx="30" cy="165" r="22" className="fill-forest-500 dark:fill-forest-500 opacity-70" />
      <circle cx="55" cy="168" r="20" className="fill-forest-400 dark:fill-forest-600 opacity-75" />

      {/* Bottom right cluster */}
      <circle cx="158" cy="178" r="28" className="fill-forest-400 dark:fill-forest-600 opacity-80" />
      <circle cx="170" cy="165" r="22" className="fill-forest-500 dark:fill-forest-500 opacity-70" />
      <circle cx="145" cy="168" r="20" className="fill-forest-400 dark:fill-forest-600 opacity-75" />

      {/* Mid left */}
      <circle cx="52" cy="148" r="25" className="fill-forest-400 dark:fill-forest-600 opacity-80" />
      <circle cx="38" cy="138" r="20" className="fill-forest-500 dark:fill-forest-500 opacity-75" />

      {/* Mid right */}
      <circle cx="148" cy="148" r="25" className="fill-forest-400 dark:fill-forest-600 opacity-80" />
      <circle cx="162" cy="138" r="20" className="fill-forest-500 dark:fill-forest-500 opacity-75" />

      {/* Center upper clusters */}
      <circle cx="100" cy="135" r="32" className="fill-forest-500 dark:fill-forest-500 opacity-85" />
      <circle cx="80" cy="118" r="26" className="fill-forest-400 dark:fill-forest-600 opacity-80" />
      <circle cx="120" cy="118" r="26" className="fill-forest-400 dark:fill-forest-600 opacity-80" />
      <circle cx="100" cy="105" r="30" className="fill-forest-500 dark:fill-forest-400 opacity-85" />

      {/* Top clusters */}
      <circle cx="85" cy="90" r="24" className="fill-forest-500 dark:fill-forest-400 opacity-80" />
      <circle cx="115" cy="90" r="24" className="fill-forest-500 dark:fill-forest-400 opacity-80" />
      <circle cx="100" cy="78" r="26" className="fill-forest-400 dark:fill-forest-500 opacity-85" />
      <circle cx="100" cy="62" r="22" className="fill-forest-500 dark:fill-forest-400 opacity-90" />

      {/* Very top */}
      <circle cx="100" cy="46" r="18" className="fill-forest-400 dark:fill-forest-500 opacity-85" />
      <circle cx="88" cy="38" r="14" className="fill-forest-500 dark:fill-forest-400 opacity-80" />
      <circle cx="112" cy="38" r="14" className="fill-forest-500 dark:fill-forest-400 opacity-80" />
      <circle cx="100" cy="28" r="14" className="fill-forest-400 dark:fill-forest-500 opacity-90" />
    </svg>
  );
}
