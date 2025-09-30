import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { useMemo } from "react";
import { ShortlistDataTable } from "./components/ShortlistDataTable";

interface ShortlistInstrument {
  id: string;
  exchange: string;
  trading_symbol: string;
  groww_symbol: string;
  name: string;
}

export const ShortlistCard = () => {
  // VARIABLES
  const columns: ColumnDef<ShortlistInstrument>[] = useMemo(() => {
    const columnData: ColumnDef<ShortlistInstrument>[] = [
      {
        id: "name",
        accessorKey: "name",
        header: "Company",
      },
      {
        id: "trading_symbol",
        accessorKey: "trading_symbol",
        header: "Symbol",
      },
      {
        id: "exchange",
        accessorKey: "exchange",
        header: "Exchange",
      },
      {
        id: "actions",
        cell: () => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem>Remove from shortlist</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ];

    return columnData;
  }, []);

  // DRAW
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Shortlist</CardTitle>
      </CardHeader>
      <CardContent className="w-full h-full grid grid-rows-[auto_1fr] gap-2">
        <div className="w-full h-full">
          <ShortlistDataTable columns={columns} data={[]} />
        </div>
      </CardContent>
    </Card>
  );
};
