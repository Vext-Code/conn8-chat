import { Skeleton } from "@/components/ui/skeleton"

export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header Skeleton */}
      <div className="border-b p-4 flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-6 w-48 rounded-md" />
      </div>

      {/* Message List Skeleton */}
      <div className="flex-1 px-4 py-4 space-y-6">
        <div className="flex items-center gap-3 justify-start">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-10 w-3/5 rounded-lg" />
        </div>
        <div className="flex items-center gap-3 justify-end">
          <Skeleton className="h-10 w-1/2 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex items-center gap-3 justify-start">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-12 w-4/5 rounded-lg" />
        </div>
        <div className="flex items-center gap-3 justify-end">
          <Skeleton className="h-8 w-2/5 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      {/* Message Input Skeleton */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
        </div>
      </div>
    </div>
  )
}
