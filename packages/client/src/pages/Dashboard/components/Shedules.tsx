import { Icon } from "@iconify/react";
import { Accordion, Button, TextInput } from "@mantine/core";
import { times } from "lodash";
import { CollapsiblePanel } from "./CollapsiblePanel";

export const Schedules = () => {
  // DRAW
  return (
    <CollapsiblePanel
      containerClassName="flex-1 overflow-hidden"
      title="Schedules"
    >
      <div className="w-full h-full grid grid-rows-[auto_1fr] gap-2 overflow-hidden">
        <TextInput
          placeholder="Search for schedules"
          size="sm"
          leftSection={<Icon icon="material-symbols:search-rounded" />}
        />
        <Button
          leftSection={
            <Icon icon="material-symbols:add" height={18} width={18} />
          }
        >
          Create Schedule
        </Button>
        <div className="w-full h-full overflow-auto">
          <Accordion variant="separated">
            {times(20, (index) => {
              return (
                <Accordion.Item
                  key={`schedule-${index}`}
                  value={`Schedule ${index + 1}`}
                >
                  <Accordion.Control>Schedule 1</Accordion.Control>
                  <Accordion.Panel>This is template content∏</Accordion.Panel>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </div>
      </div>
    </CollapsiblePanel>
  );
};
