import { AshTree } from "@/components/ui/AshTree";

export function EmptyChat() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center select-none">
      <AshTree className="w-32 h-44 mb-6 opacity-40 dark:opacity-25" />
      <h2 className="text-xl font-semibold text-stone-700 dark:text-stone-300 mb-2">
          ЯсеньИИ
      </h2>
      <p className="text-sm text-stone-400 dark:text-stone-500 max-w-xs leading-relaxed">
        Начните разговор — напишите сообщение ниже, и я отвечу вам.
      </p>
    </div>
  );
}
