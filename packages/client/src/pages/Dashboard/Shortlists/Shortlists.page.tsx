import { shortlistsAPI } from "@/store/api/shortlists.api";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Paper } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { CompaniesPane } from "./components/CompaniesPane/CompaniesPane";
import { CompanyCardContent } from "./components/CompaniesPane/components/CompaniesTab";
import { ShortlistsPane } from "./components/ShortlistsPane/ShortlistsPane";

export const ShortlistsPage = () => {
  // STATE
  const [activeCompany, setActiveCompany] = useState<{
    name: string;
    symbol: string;
  } | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [updatingShortlistId, setUpdatingShortlistId] = useState<string | null>(
    null
  );

  // API
  const [updateShortlist] = shortlistsAPI.useUpdateShortlistMutation();

  // HANDLERS
  const handleDragStart = (event: DragStartEvent) => {
    const dragData = event.active.data.current;
    if (dragData?.type === "company") {
      setActiveCompany({
        name: dragData.name as string,
        symbol: dragData.symbol as string,
      });
    }
  };
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      const dropData = over.data.current;
      if (dropData?.type === "shortlist") {
        setOverId(over.id as string);
      } else {
        setOverId(null);
      }
    } else {
      setOverId(null);
    }
  };
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveCompany(null);
    setOverId(null);
    const { active, over } = event;

    if (!over) return;

    // Check if we're dropping a company onto a shortlist
    const dragData = active.data.current;
    const dropData = over.data.current;

    if (dragData?.type === "company" && dropData?.type === "shortlist") {
      const instrumentId = dragData.instrumentId as string;
      const shortlistId = dropData.shortlistId as string;
      const shortlist = dropData.shortlist;

      // Check if instrument is already in the shortlist
      const instrumentIds = shortlist.instruments.map(
        (inst: { id: string }) => inst.id
      );
      if (instrumentIds.includes(instrumentId)) {
        notifications.show({
          title: "Already in shortlist",
          message: `${dragData.name} is already in ${shortlist.name}`,
          color: "yellow",
        });
        return;
      }

      // Add instrument to shortlist
      setUpdatingShortlistId(shortlistId);
      try {
        const response = await updateShortlist({
          params: { id: shortlistId },
          body: {
            name: shortlist.name,
            instruments: [...instrumentIds, instrumentId],
          },
        });

        if (response.data) {
          notifications.show({
            title: "Success",
            message: `Added ${dragData.name} to ${shortlist.name}`,
            color: "green",
          });
        }
      } catch (e) {
        console.error(e);
        notifications.show({
          title: "Error",
          message: "Failed to add instrument to shortlist",
          color: "red",
        });
      } finally {
        setUpdatingShortlistId(null);
      }
    }
  };

  // DRAW
  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-full overflow-hidden grid grid-cols-[350px_400px_1fr] gap-2">
        <CompaniesPane />
        <ShortlistsPane
          overId={overId}
          updatingShortlistId={updatingShortlistId}
        />
      </div>
      <DragOverlay>
        {activeCompany ? (
          <Paper p="sm" withBorder shadow="lg" className="opacity-90">
            <CompanyCardContent
              name={activeCompany.name}
              symbol={activeCompany.symbol}
            />
          </Paper>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
