"use client";

import React from "react";
import {
  Avatar,
  Button,
  ScrollShadow,
  Spacer,
  Input,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";


/**
 * 💡 TIP: You can use the usePathname hook from Next.js App Router to get the current pathname
 * and use it as the active key for the Sidebar component.
 *
 * ```tsx
 * import {usePathname} from "next/navigation";
 *
 * const pathname = usePathname();
 * const currentPath = pathname.split("/")?.[1]
 *
 * <Sidebar defaultSelectedKey="home" selectedKeys={[currentPath]} />
 * ```
 */
export default function Component({
  children,
  header
}: {
  children?: React.ReactNode;
  header?: React.ReactNode;
  title?: React.ReactNode;
}) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();


  return (
    <div className="flex h-dvh w-full justify-center">

      <div className="flex w-full flex-col gap-y-4 p-4 sm:max-w-[calc(100%_-_288px)] ">
        <header className="flex h-16 min-h-16 items-center justify-between gap-2 overflow-x-scroll rounded-medium border-small border-gray-700 px-4 py-2">
          <div className="flex max-w-full items-center gap-2">
            <Button
              isIconOnly
              className="flex sm:hidden"
              size="sm"
              variant="light"
              onPress={onOpen}
            >
              <Icon
                className="text-gray-400"
                height={24}
                icon="solar:hamburger-menu-outline"
                width={24}
              />
            </Button>
            <h2 className="truncate text-medium font-medium text-gray-300">
          
            </h2>
          </div>
          {header}
        </header>
        <main className="flex h-full">
          <div className="flex h-full w-full flex-col gap-4 rounded-medium border-small border-gray-700 p-6 bg-gray-900">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
