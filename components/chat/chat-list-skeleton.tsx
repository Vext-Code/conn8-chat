import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ChatListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64 rounded-md" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-4/5 rounded-md" />
              <Skeleton className="h-4 w-3/5 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-1/2 rounded-md" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
