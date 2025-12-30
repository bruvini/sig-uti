import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  BarChart3,
  Settings,
  FileText,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: ClipboardList, label: "Fila de Espera", path: "/queue" },
  { icon: PlusCircle, label: "Nova Solicitação", path: "/new-request" },
  { icon: BarChart3, label: "Indicadores", path: "/analytics" },
  { icon: FileText, label: "Auditoria", path: "/audit" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 transform border-r bg-card transition-transform duration-200 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-end p-4 md:hidden">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Ethics Notice */}
          <div className="border-t p-4">
            <div className="flex items-start gap-2 rounded-lg bg-info/10 p-3 text-xs">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-info" />
              <div>
                <p className="font-medium text-foreground">
                  Resolução CFM 2.156/2016
                </p>
                <p className="mt-1 text-muted-foreground">
                  Critérios de admissão baseados em indicadores clínicos, sem
                  discriminação.
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
