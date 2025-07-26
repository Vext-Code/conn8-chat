'use client'

import { ChatSidebar } from '@/components/chat/chat-sidebar'
import { Button } from '@/components/ui/button'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { Chat } from '@/lib/types'
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import * as React from 'react'

interface ChatLayoutClientProps {
  children: React.ReactNode
  activeChatId: string
  chats: Chat[]
}

import { ImperativePanelHandle } from 'react-resizable-panels'

// ... (kode lainnya tetap sama)

export function ChatLayoutClient({ children, activeChatId, chats }: ChatLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const panelRef = React.useRef<ImperativePanelHandle>(null)

  const toggleSidebar = () => {
    const panel = panelRef.current
    if (panel) {
      if (panel.isCollapsed()) {
        panel.expand()
      } else {
        panel.collapse()
      }
    }
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`
      }}
      className="h-full max-h-screen items-stretch"
    >
      <ResizablePanel
        ref={panelRef}
        defaultSize={20}
        collapsedSize={4}
        collapsible={true}
        minSize={15}
        maxSize={25}
        onCollapse={() => setIsCollapsed(true)}
        onExpand={() => setIsCollapsed(false)}
        className={cn(
          'min-w-[50px] transition-all duration-300 ease-in-out',
          'hidden md:block'
        )}
      >
        <div className="flex h-full flex-col items-center">
          <div className="flex h-16 items-center justify-center border-b">
            <Button
              onClick={toggleSidebar}
              size="icon"
              variant="ghost"
            >
              {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
            </Button>
          </div>
          <div className={cn(
            "flex-1 overflow-y-auto w-full",
            isCollapsed && "hidden"
          )}>
            <ChatSidebar activeChatId={activeChatId} chats={chats} />
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel defaultSize={80}>
        <div className="md:hidden p-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <ChatSidebar activeChatId={activeChatId} chats={chats} />
            </SheetContent>
          </Sheet>
        </div>
        <main className="flex flex-col h-full">{children}</main>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
