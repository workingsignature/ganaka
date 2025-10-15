import { Button, Checkbox, Table, Tabs } from "@mantine/core";
import { CollapsiblePanel } from "./CollapsiblePanel";
import { Icon } from "@iconify/react";

export const Shortlists = () => {
  // DRAW
  return (
    <CollapsiblePanel containerClassName="flex-2" title="Shortlists">
      <Tabs variant="pills" color="dark" defaultValue="gallery">
        <Tabs.List>
          <Tabs.Tab value="gallery">Today (Oct 3rd)</Tabs.Tab>
          <Tabs.Tab value="messages">Schedule</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel
          className="w-full h-full pt-2 flex flex-col gap-2"
          value="gallery"
        >
          <Button
            leftSection={
              <Icon icon="material-symbols:add" height={18} width={18} />
            }
            fullWidth
          >
            Add Company to Default Shortlist
          </Button>
          <Table highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th />
                <Table.Th>Name</Table.Th>
                <Table.Th>% Change</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>
                  <Checkbox checked={false} />
                </Table.Td>
                <Table.Td>1</Table.Td>
                <Table.Td>Hydrogen</Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
        <Tabs.Panel className="w-full h-full pt-2" value="messages">
          <Button
            leftSection={
              <Icon icon="material-symbols:add" height={18} width={18} />
            }
            fullWidth
          >
            Add Company to Schedule Shortlist
          </Button>
        </Tabs.Panel>
      </Tabs>
    </CollapsiblePanel>
  );
};
